import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface Person {
  name: string;
  description: string;
}

interface FileUploadProps {
  onPeopleLoaded: (people: Person[]) => void;
}

export const FileUpload = ({ onPeopleLoaded }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (content: string): Person[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const header = lines[0].toLowerCase();
    if (!header.includes('name') || !header.includes('description')) {
      throw new Error('CSV must have "Names" and "Description" columns');
    }

    const people: Person[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length >= 2 && values[0] && values[1]) {
        people.push({
          name: values[0],
          description: values[1]
        });
      }
    }

    return people;
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const content = await file.text();
      const people = parseCSV(content);
      
      if (people.length === 0) {
        throw new Error('No valid people found in CSV');
      }

      toast({
        title: "File uploaded successfully",
        description: `Loaded ${people.length} people from CSV`
      });

      onPeopleLoaded(people);
    } catch (error) {
      toast({
        title: "Error parsing CSV",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <Card className={`
      relative border-2 border-dashed border-border bg-gradient-to-br from-accent/5 to-accent/10
      transition-all duration-300 ease-in-out hover:shadow-lg
      ${isDragging ? 'border-primary bg-primary/5 scale-105' : ''}
      ${isProcessing ? 'pointer-events-none opacity-50' : ''}
    `}>
      <div
        className="p-12 text-center cursor-pointer"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            p-4 rounded-full bg-gradient-to-br from-primary/10 to-primary-glow/10 
            transition-transform duration-300
            ${isDragging ? 'scale-110' : ''}
          `}>
            {isProcessing ? (
              <div className="animate-spin">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isProcessing ? 'Processing CSV...' : 'Upload CSV File'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Drag and drop your CSV file here, or click to browse. 
              File should have "Names" and "Description" columns.
            </p>
          </div>
          
          <Button variant="outline" disabled={isProcessing}>
            Choose File
          </Button>
        </div>
        
        <div className="mt-6 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-start space-x-2 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            <div className="text-left">
              <strong>CSV Format:</strong> First column should be "Names", second column "Description". 
              Each description should contain details about the person to help with table assignments.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};