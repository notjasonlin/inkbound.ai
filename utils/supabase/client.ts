import { CoachData } from "@/types/school";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function getCoaches(schoolId?: string) {
  const supabase = createClient();
  if (schoolId) {
    const { data, error } = await supabase
      .from("coachinformation")
      .select("*")
      .eq("schoolId", schoolId);

    if (error) {
      console.error("Error fetching coaches:", error);
      return [];
    }

    return data || [];
  } else {
    const { data, error } = await supabase
      .from("coachinformation")
      .select("*");

    if (error) {
      console.error("Error fetching coaches:", error);
      return [];
    }

    return data || [];
  }
}

export async function getUniqueSchools() {
  const supabase = createClient();
  let allData: any[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("school")
      .select("*")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching schools:", error);
      return [];
    }

    // console.log("NEW SCHOOLS", data);

    if (data.length === 0) break;

    allData = allData.concat(data);
    page++;

    if (data.length < pageSize) break;
  }

  const schoolsMap = new Map();

  allData.forEach((item) => {
    if (item) {
      schoolsMap.set(item.id, {
        id: item.id,
        school: item.school_name,
        coaches: [],
        division: item.division,
        state: item.state,
        conference: item.conference,
      });
    }
  });

  const coaches = await getCoaches();

  coaches.forEach((item) => {
    const curr = schoolsMap.get(item.schoolId);
    if (curr) {
      const coach = {
        name: item.name,
        position: item.position,
        email: item.email,
      };
      curr.coaches.push(coach);
      schoolsMap.set(item.schoolsId, curr);
    }
  });

  const uniqueSchools = Array.from(schoolsMap.values());

  return uniqueSchools;
}

export async function getSchool(schoolName: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("school")
    .select("*")
    .ilike("school_name", schoolName.trim());

  if (error) {
    console.error("Error fetching schools:", error);
    return null;
  }

  const coaches = await getCoaches(data[0].id);

  const coachData: CoachData[] = [];
  coaches.forEach((item) => {
    const coach = {
      name: item.name,
      position: item.position,
      email: item.email,
    };

    coachData.push(coach);
  });

  const school = {
    id: data[0].id,
    school: data[0].school_name,
    coaches: coachData,
    division: data[0].division,
    state: data[0].state,
    conference: data[0].conference,
  };

  console.log(school);
  return school;
}
