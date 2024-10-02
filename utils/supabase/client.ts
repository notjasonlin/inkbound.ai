import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

  // Use a Map to keep track of unique schools
  const uniqueSchools = new Map();
  
  allData.forEach(item => {
    if (item && item.school) {
      const schoolKey = item.school.trim().toLowerCase();
      if (!uniqueSchools.has(schoolKey)) {
        uniqueSchools.set(schoolKey, {
          school: item.school,
          state: item.state,
          division: item.division,
          coachCount: 1
        });
      } else {
        uniqueSchools.get(schoolKey).coachCount++;
      }
    } else {
      console.warn('Found an item with null or undefined school:', item);
    }
  });
  
  const schoolsArray = Array.from(uniqueSchools.values());
  
  console.log('Unique schools found:', schoolsArray.length);
  console.log('First 5 schools:', schoolsArray.slice(0, 5));
  console.log('Last 5 schools:', schoolsArray.slice(-5));

  // Log summary of coach counts
  const coachCounts = new Map();
  schoolsArray.forEach(({ coachCount }) => {
    coachCounts.set(coachCount, (coachCounts.get(coachCount) || 0) + 1);
  });
  
  console.log('Summary of coach counts:');
  for (const [count, schools] of Object.entries(coachCounts)) {
    console.log(`Schools with ${count} ${Number(count) === 1 ? 'coach' : 'coaches'}: ${schools}`);
  }

  return schoolsArray;
}

