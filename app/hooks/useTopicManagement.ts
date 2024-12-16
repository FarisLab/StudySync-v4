'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Topic, TopicIcon } from '../types';

const supabase = createClientComponentClient();

export const useTopicManagement = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicsSearchQuery, setTopicsSearchQuery] = useState('');
  const [topicsSortBy, setTopicsSortBy] = useState('name');

  // Fetch topics
  const fetchTopics = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('topics')
        .select('*, documents(*)')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      setTopics(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
    } finally {
      setIsLoading(false);
    }
  };

  // Create topic
  const handleCreateTopic = async (userId: string, topicData: Partial<Topic>) => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .insert([{ ...topicData, user_id: userId, icon: topicData.icon ?? 'Folder' }])
        .select('*, documents(*)')
        .single();

      if (error) throw error;

      // Update local state with the new topic
      setTopics(prev => [...prev, data]);
      setError(null);
      return data;
    } catch (err) {
      console.error('Failed to create topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to create topic');
      throw err;
    }
  };

  // Rename topic
  const handleRenameTopic = async (topicId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ name: newName })
        .eq('id', topicId);

      if (error) throw error;

      // Update local state with the updated topic
      setTopics(prev => prev.map(topic => 
        topic.id === topicId ? { ...topic, name: newName } : topic
      ));
      setError(null);
    } catch (err) {
      console.error('Failed to rename topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to rename topic');
    }
  };

  // Update topic
  const handleUpdateTopic = async (topicId: string, updates: Partial<Topic>) => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .update(updates)
        .eq('id', topicId)
        .select()
        .single();

      if (error) throw error;

      // Update local state with the updated topic
      setTopics(prev => prev.map(topic => 
        topic.id === topicId ? { ...topic, ...updates } : topic
      ));
      setError(null);
      return data;
    } catch (err) {
      console.error('Failed to update topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to update topic');
      throw err;
    }
  };

  // Delete topic
  const handleDeleteTopic = async (topicId: string) => {
    try {
      // First update all documents in this topic to have no topic
      const { error: updateError } = await supabase
        .from('documents')
        .update({ topic_id: null })
        .eq('topic_id', topicId);

      if (updateError) throw updateError;

      // Then delete the topic
      const { error: deleteError } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId);

      if (deleteError) throw deleteError;

      setTopics(prev => prev.filter(topic => topic.id !== topicId));
      if (selectedTopic === topicId) {
        setSelectedTopic(null);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to delete topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete topic');
    }
  };

  return {
    topics,
    selectedTopic,
    setSelectedTopic,
    isCreatingTopic,
    setIsCreatingTopic,
    editingTopic,
    setEditingTopic,
    editingTopicId,
    setEditingTopicId,
    newName,
    setNewName,
    isLoading,
    error,
    topicsSearchQuery,
    setTopicsSearchQuery,
    topicsSortBy,
    setTopicsSortBy,
    fetchTopics,
    handleCreateTopic,
    handleRenameTopic,
    handleUpdateTopic,
    handleDeleteTopic,
  };
};
