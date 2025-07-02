interface Person {
  name: string;
  description: string;
}

interface Table {
  id: number;
  people: Person[];
}

// Simple keyword extraction for similarity matching
const extractKeywords = (text: string): string[] => {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
    .slice(0, 10); // Limit to most relevant keywords
};

// Calculate similarity between two people based on their descriptions
const calculateSimilarity = (person1: Person, person2: Person): number => {
  const keywords1 = new Set(extractKeywords(person1.description));
  const keywords2 = new Set(extractKeywords(person2.description));
  
  const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
  const union = new Set([...keywords1, ...keywords2]);
  
  // Jaccard similarity coefficient
  return union.size > 0 ? intersection.size / union.size : 0;
};

// Calculate the diversity score for a table (higher is better for mixing)
const calculateTableDiversity = (people: Person[]): number => {
  if (people.length <= 1) return 0;
  
  let totalSimilarity = 0;
  let comparisons = 0;
  
  for (let i = 0; i < people.length; i++) {
    for (let j = i + 1; j < people.length; j++) {
      totalSimilarity += calculateSimilarity(people[i], people[j]);
      comparisons++;
    }
  }
  
  // Return diversity (lower similarity = higher diversity)
  return comparisons > 0 ? 1 - (totalSimilarity / comparisons) : 0;
};

// Assign people to tables using a greedy algorithm with diversity optimization
export const assignPeopleToTables = (people: Person[]): Table[] => {
  const tables: Table[] = [];
  const unassigned = [...people];
  const maxTableSize = 10;
  let tableCounter = 1;

  while (unassigned.length > 0) {
    const currentTable: Person[] = [];
    
    // Start with a random person for each table
    const startIndex = Math.floor(Math.random() * unassigned.length);
    currentTable.push(unassigned.splice(startIndex, 1)[0]);

    // Fill the table to optimize for diversity
    while (currentTable.length < maxTableSize && unassigned.length > 0) {
      let bestPerson: Person | null = null;
      let bestIndex = -1;
      let bestScore = -1;

      // Find the person who would create the most diverse table
      for (let i = 0; i < unassigned.length; i++) {
        const candidate = unassigned[i];
        const testTable = [...currentTable, candidate];
        const diversityScore = calculateTableDiversity(testTable);
        
        // Prefer diversity, but also consider not making tables too uneven
        let score = diversityScore;
        
        // Bonus for filling tables more evenly
        if (unassigned.length <= maxTableSize && currentTable.length < maxTableSize) {
          score += 0.1;
        }

        if (score > bestScore) {
          bestScore = score;
          bestPerson = candidate;
          bestIndex = i;
        }
      }

      if (bestPerson && bestIndex >= 0) {
        currentTable.push(bestPerson);
        unassigned.splice(bestIndex, 1);
      } else {
        break; // Safety break
      }
    }

    tables.push({
      id: tableCounter++,
      people: currentTable
    });
  }

  return tables;
};

// Export table assignments as CSV
export const exportTableAssignments = (tables: Table[]): string => {
  const rows = ['Table,Name,Description'];
  
  tables.forEach(table => {
    table.people.forEach(person => {
      const escapedDescription = `"${person.description.replace(/"/g, '""')}"`;
      rows.push(`${table.id},${person.name},${escapedDescription}`);
    });
  });
  
  return rows.join('\n');
};

// Download the exported data as a file
export const downloadTableAssignments = (tables: Table[]) => {
  const csvContent = exportTableAssignments(tables);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'table-assignments.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};