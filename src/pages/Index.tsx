import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { TableAssignment } from '@/components/TableAssignment';
import { assignPeopleToTables, downloadTableAssignments } from '@/utils/tableAssignment';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Person {
  name: string;
  description: string;
}

interface Table {
  id: number;
  people: Person[];
}

const Index = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const handlePeopleLoaded = (loadedPeople: Person[]) => {
    setPeople(loadedPeople);
    assignTables(loadedPeople);
  };

  const assignTables = async (peopleToAssign: Person[]) => {
    setIsAssigning(true);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const assignedTables = assignPeopleToTables(peopleToAssign);
      setTables(assignedTables);
      
      toast({
        title: "Tables assigned successfully",
        description: `Created ${assignedTables.length} tables with optimized seating arrangements`
      });
    } catch (error) {
      toast({
        title: "Error assigning tables",
        description: "Failed to create table assignments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReassign = () => {
    if (people.length > 0) {
      assignTables(people);
    }
  };

  const handleExport = () => {
    downloadTableAssignments(tables);
    toast({
      title: "Export successful",
      description: "Table assignments have been downloaded as CSV"
    });
  };

  const handleReset = () => {
    setPeople([]);
    setTables([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 rounded-full bg-gradient-to-br from-primary/10 to-primary-glow/10 mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl">🪑</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Smart Table Assignment
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload a CSV file with attendee information and let our intelligent algorithm 
            create optimal table arrangements based on compatibility and interests.
          </p>
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto">
          {tables.length === 0 ? (
            <div className="space-y-8">
              <FileUpload onPeopleLoaded={handlePeopleLoaded} />
              
              {isAssigning && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-lg text-muted-foreground">Creating optimal table assignments...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Action bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-card rounded-lg border">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Upload New File</span>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {people.length} people assigned to {tables.length} tables
                </div>
              </div>

              {/* Table assignments */}
              <TableAssignment 
                tables={tables} 
                onReassign={handleReassign}
                onExport={handleExport}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
