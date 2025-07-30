import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dropzone = ({ file, setFile, title = "Foto do Documento (Frente)", description = "Arraste ou clique para enviar. (PNG, JPG, PDF até 5MB)" }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  const isFileTooLarge = fileRejections.length > 0 && fileRejections[0].errors[0].code === 'file-too-large';

  return (
    <div {...getRootProps()} className={`relative p-4 text-center border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}>
      <input {...getInputProps()} />
      {file ? (
        <div className="flex flex-col items-center justify-center text-center">
          <FileIcon className="w-10 h-10 text-green-500" />
          <p className="mt-2 text-sm font-medium text-gray-800 truncate max-w-full">{file.name}</p>
          <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
          <Button variant="ghost" size="icon" onClick={removeFile} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-gray-200 hover:bg-gray-300">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <UploadCloud className="w-10 h-10 text-gray-400" />
          <p className="mt-2 text-sm font-semibold text-gray-700">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
          {isDragActive && <p className="mt-1 text-sm text-pink-600">Solte o arquivo aqui!</p>}
          {isFileTooLarge && <p className="mt-1 text-sm text-red-500">Arquivo muito grande! Máx 5MB.</p>}
        </div>
      )}
    </div>
  );
};

export default Dropzone;