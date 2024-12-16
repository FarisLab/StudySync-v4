import React from 'react';

interface FileIconProps {
  className?: string;
}

const FileIcon: React.FC<FileIconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0013.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9Z" />
  </svg>
);

const PDFIcon: React.FC<FileIconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 18H17V16H7V18Z" fill="currentColor" fillOpacity="0.5"/>
    <path d="M17 14H7V12H17V14Z" fill="currentColor" fillOpacity="0.5"/>
    <path d="M7 10H11V8H7V10Z" fill="currentColor" fillOpacity="0.5"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M6.5 3H14.1716L19 7.82843V19.5C19 20.3284 18.3284 21 17.5 21H6.5C5.67157 21 5 20.3284 5 19.5V4.5C5 3.67157 5.67157 3 6.5 3ZM13.9999 4.5H6.5C6.49989 4.5 6.49989 4.50011 6.5 4.50011L6.5 19.5C6.5 19.5001 6.50011 19.5001 6.50011 19.5H17.5001C17.5001 19.5 17.5 19.4999 17.5 19.4999L17.4999 8.5L13.9999 4.5Z" fill="currentColor"/>
  </svg>
);

const WordIcon: React.FC<FileIconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 4.5V8.5H17.5L12.5 4.5Z" fill="currentColor" fillOpacity="0.5"/>
    <path d="M7 12L8.5 18H10L11 14L12 18H13.5L15 12H13.5L12.75 16L11.75 12H10.25L9.25 16L8.5 12H7Z" fill="currentColor" fillOpacity="0.5"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M5 4.5C5 3.67157 5.67157 3 6.5 3H14.1716L19 7.82843V19.5C19 20.3284 18.3284 21 17.5 21H6.5C5.67157 21 5 20.3284 5 19.5V4.5C5 3.67157 5.67157 3 6.5 3ZM6.5 4.5V19.5H17.5V8.5H12.5V4.5H6.5Z" fill="currentColor"/>
  </svg>
);

const PowerPointIcon: React.FC<FileIconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 4.5V8.5H17.5L12.5 4.5Z" fill="currentColor" fillOpacity="0.5"/>
    <path d="M8 11V18H9.5V15.5H11C12.3807 15.5 13.5 14.3807 13.5 13C13.5 11.6193 12.3807 10.5 11 10.5H8V11ZM9.5 14V12H11C11.5523 12 12 12.4477 12 13C12 13.5523 11.5523 14 11 14H9.5Z" fill="currentColor" fillOpacity="0.5"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M5 4.5C5 3.67157 5.67157 3 6.5 3H14.1716L19 7.82843V19.5C19 20.3284 18.3284 21 17.5 21H6.5C5.67157 21 5 20.3284 5 19.5V4.5ZM6.5 4.5V19.5H17.5V8.5H12.5V4.5H6.5Z" fill="currentColor"/>
  </svg>
);

const ImageIcon: React.FC<FileIconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z" fill="currentColor" fillOpacity="0.5"/>
    <path d="M15 14L12.7071 11.7071L9 15.4142L7.70711 14.1213L6 15.8284V17H18V15L15 14Z" fill="currentColor" fillOpacity="0.5"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M6.5 3H14.1716L19 7.82843V19.5C19 20.3284 18.3284 21 17.5 21H6.5C5.67157 21 5 20.3284 5 19.5V4.5C5 3.67157 5.67157 3 6.5 3ZM6.5 4.5V19.5H17.5V8.5H12.5V4.5H6.5Z" fill="currentColor"/>
  </svg>
);

const SpreadsheetIcon: React.FC<FileIconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 4.5V8.5H17.5L12.5 4.5Z" fill="currentColor" fillOpacity="0.5"/>
    <path d="M7 10V18H17V10H7ZM8.5 11.5H10.5V13.5H8.5V11.5ZM8.5 14.5H10.5V16.5H8.5V14.5ZM11.5 11.5H15.5V13.5H11.5V11.5ZM11.5 14.5H15.5V16.5H11.5V14.5Z" fill="currentColor" fillOpacity="0.5"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M5 4.5C5 3.67157 5.67157 3 6.5 3H14.1716L19 7.82843V19.5C19 20.3284 18.3284 21 17.5 21H6.5C5.67157 21 5 20.3284 5 19.5V4.5ZM6.5 4.5V19.5H17.5V8.5H12.5V4.5H6.5Z" fill="currentColor"/>
  </svg>
);

const VideoIcon: React.FC<FileIconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 4.5V8.5H17.5L12.5 4.5Z" fill="currentColor" fillOpacity="0.5"/>
    <path d="M8 11V17H13V15L16 16.5V11.5L13 13V11H8Z" fill="currentColor" fillOpacity="0.5"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M5 4.5C5 3.67157 5.67157 3 6.5 3H14.1716L19 7.82843V19.5C19 20.3284 18.3284 21 17.5 21H6.5C5.67157 21 5 20.3284 5 19.5V4.5ZM6.5 4.5V19.5H17.5V8.5H12.5V4.5H6.5Z" fill="currentColor"/>
  </svg>
);

const TextIcon: React.FC<FileIconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 4.5V8.5H17.5L12.5 4.5Z" fill="currentColor" fillOpacity="0.5"/>
    <path d="M8 11V12.5H10.5V17H12V12.5H14.5V11H8Z" fill="currentColor" fillOpacity="0.5"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M5 4.5C5 3.67157 5.67157 3 6.5 3H14.1716L19 7.82843V19.5C19 20.3284 18.3284 21 17.5 21H6.5C5.67157 21 5 20.3284 5 19.5V4.5C5 3.67157 5.67157 3 6.5 3ZM6.5 4.5V19.5H17.5V8.5H12.5V4.5H6.5Z" fill="currentColor"/>
  </svg>
);

export function getFileIcon(filename: string, className?: string) {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return <PDFIcon className={className} />;

    case 'doc':
    case 'docx':
      return <WordIcon className={className} />;

    case 'ppt':
    case 'pptx':
      return <PowerPointIcon className={className} />;

    case 'xls':
    case 'xlsx':
    case 'csv':
      return <SpreadsheetIcon className={className} />;

    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
      return <ImageIcon className={className} />;

    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return <VideoIcon className={className} />;

    case 'txt':
    case 'md':
    case 'rtf':
      return <TextIcon className={className} />;

    default:
      return <FileIcon className={className} />;
  }
}
