import { Users, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Person {
  name: string;
  description: string;
}

interface Table {
  id: number;
  people: Person[];
}

interface TableAssignmentProps {
  tables: Table[];
  onReassign: () => void;
  onExport: () => void;
}

export const TableAssignment = ({ tables, onReassign, onExport }: TableAssignmentProps) => {
  const totalPeople = tables.reduce((sum, table) => sum + table.people.length, 0);

  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Table Assignments</h2>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{totalPeople} people</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{tables.length} tables</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onReassign} className="flex items-center space-x-2">
            <RotateCcw className="h-4 w-4" />
            <span>Reassign</span>
          </Button>
          <Button onClick={onExport} className="flex items-center space-x-2 bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="overflow-hidden bg-gradient-to-br from-card to-accent/5 border border-border/50">
            <div className="p-6">
              {/* Table header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <h3 className="font-semibold text-foreground">Table {table.id}</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {table.people.length} people
                </Badge>
              </div>

              {/* Circular table visualization */}
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-muted to-muted/50 border-2 border-border flex items-center justify-center">
                  <div className="text-2xl font-bold text-muted-foreground">{table.id}</div>
                </div>
                
                {/* People positioned around the table */}
                <div className="absolute inset-0">
                  {table.people.map((person, index) => {
                    const angle = (index / table.people.length) * 2 * Math.PI - Math.PI / 2;
                    const radius = 80;
                    const x = 50 + (radius * Math.cos(angle)) / 2;
                    const y = 50 + (radius * Math.sin(angle)) / 2;
                    
                    return (
                      <div
                        key={index}
                        className="absolute w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                        }}
                        title={person.name}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* People list */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Attendees:</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {table.people.map((person, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium text-primary flex-shrink-0 mt-0.5">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate">
                          {person.name}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {person.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state for incomplete tables */}
      {tables.some(table => table.people.length < 10) && (
        <Card className="p-4 bg-accent/10 border border-accent/20">
          <div className="flex items-start space-x-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-foreground">Note:</strong>
              <span className="text-muted-foreground ml-1">
                Some tables have fewer than 10 people. The algorithm optimizes for compatibility 
                while trying to balance table sizes.
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};