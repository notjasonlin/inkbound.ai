import { CoachData } from "@/types/school";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function getCoaches() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("coachinformation")
    .select("*");

  if (error) {
    console.error("Error fetching coaches:", error);
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
      .from("coachinformation")
      .select("*")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching schools:", error);
      return [];
    }

    console.log("SCHOOLS", data)

    if (data.length === 0) break;

    allData = allData.concat(data);
    page++;

    if (data.length < pageSize) break;
  }

  const uniqueSchoolsMap = new Map();

  allData.forEach((item) => {
    if (item && item.school) {
      const schoolKey = item.school.trim().toLowerCase();

      // Check if the school is already in the map
      if (uniqueSchoolsMap.has(schoolKey)) {
        // Merge coaches array from the current item
        const existingSchool = uniqueSchoolsMap.get(schoolKey);
        // console.log(existingSchool);
        const newCoach: CoachData = {
          name: item.name,
          position: item.position,
          email: item.email,
        }
        existingSchool.coaches.push(newCoach);
      } else {
        // Add new school entry to the map
        const coach = {
          name: item.name, 
          position: item.position, 
          email: item.email
        }
        uniqueSchoolsMap.set(schoolKey, { 
          id: item.id,
          school: item.school,
          coaches: [coach],
          division: item.division,
          state: item.state,
          conference: item.conference
        });
      }
    } else {
      console.warn("Found an item with null or undefined school:", item);
    }
  });

  // Convert the Map back to an array
  const uniqueSchools = Array.from(uniqueSchoolsMap.values());


  console.log("Unique", uniqueSchools);

  return uniqueSchools;
}
