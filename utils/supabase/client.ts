import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )
}

export async function getCoaches() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('coachinformation')
    .select('*');
  
  if (error) {
    console.error('Error fetching coaches:', error);
    return [];
  }
  
  return data || [];
}

export async function getUniqueSchools() {
  const supabase = createClient();
  let allData: any[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('coachinformation')
      .select('school, state, division')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) {
      console.error('Error fetching schools:', error);
      return [];
    }

    if (data.length === 0) break;

    allData = allData.concat(data);
    page++;

    if (data.length < pageSize) break;
  }

  //console.log('Total records fetched:', allData.length);

  // Use a Map to keep track of all schools and their counts
  const schoolCounts = new Map();
  
  allData.forEach(item => {
    if (item && item.school) {
      const schoolKey = item.school.trim().toLowerCase();
      schoolCounts.set(schoolKey, (schoolCounts.get(schoolKey) || 0) + 1);
    } else {
      console.warn('Found an item with null or undefined school:', item);
    }
  });
  
  const uniqueSchools = Array.from(schoolCounts.entries()).map(([school, count]) => ({
    school: allData.find(item => item && item.school && item.school.trim().toLowerCase() === school)!,
    count
  }));
  
  //console.log('Unique schools found:', uniqueSchools.length);
  
  // Log the first few and last few schools to check
  //console.log('First 5 schools:', uniqueSchools.slice(0, 5));
  //console.log('Last 5 schools:', uniqueSchools.slice(-5));

  // Log summary of entry counts
  const entryCounts = new Map();
  uniqueSchools.forEach(({ count }) => {
    entryCounts.set(count, (entryCounts.get(count) || 0) + 1);
  });
  
  //console.log('Summary of entry counts:');
  for (const [count, schools] of Object.entries(Object.fromEntries(entryCounts))) {
    //console.log(`Schools with ${count} ${count === 1 ? 'entry' : 'entries'}: ${schools}`);
  }

  return uniqueSchools.map(({ school }) => school);
}

