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
      .select("*")
      .limit(20000);

    if (error) {
      console.error("Error fetching coaches:", error);
      return [];
    }

    console.log(data.find((item) => {
      item.school === "Aaron School";
    }));

    return data || [];
  }
}

export async function getBio(schoolId?: string) {
  const supabase = createClient();

  if (schoolId) {
    const { data, error } = await supabase
      .from("school_bio")
      .select("*")
      .eq("school_id", schoolId);

    if (error) {
      console.error("Error fetching coaches:", error);
      return [];
    }

    return data || [];
  } else {
    const { data, error } = await supabase
      .from("school_bio")
      .select("*")
      .limit(20000);

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
        biography: null,
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

  const school_bios = await getBio();

  school_bios.forEach((item) => {
    const curr = schoolsMap.get(item.school_id);
    if (curr) {
      const bio = {
        undergraduates: item.undergraduates,
        early_action: item.early_action_offered,
        early_decision: item.early_decision_offered,
        reg_admission_deadline: item.regular_admission_deadline,
        sat_math: item.sat_math,
        sat_ebrw: item.sat_ebrw,
        sat: item.sat_total,
        act: item.act_composite,
        cost: item.cost_of_attendance,
        need_met: item.average_percent_of_need_met,
        academic_calendar: item.academic_calendar_system,
        gen_ed_req: item.gen_ed_required,
        nearest_metro: item.nearest_metro,
        freshman_housing: item.freshman_housing,
        gpa: item.average_gpa,
      };
      curr.biography = bio;
      schoolsMap.set(item.school_Id, curr);
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

  const bio = await getBio(data[0].id);

  const school = {
    id: data[0].id,
    school: data[0].school_name,
    coaches: coachData,
    division: data[0].division,
    state: data[0].state,
    conference: data[0].conference,
    biography: {
      undergraduates: bio[0].undergraduates,
      early_action: bio[0].early_action_offered,
      early_decision: bio[0].early_decision_offered,
      reg_admission_deadline: bio[0].regular_admission_deadline,
      sat_math: bio[0].sat_math,
      sat_ebrw: bio[0].sat_ebrw,
      sat: bio[0].sat_total,
      act: bio[0].act_composite,
      cost: bio[0].cost_of_attendance,
      need_met: bio[0].average_percent_of_need_met,
      academic_calendar: bio[0].academic_calendar_system,
      gen_ed_req: bio[0].gen_ed_required,
      nearest_metro: bio[0].nearest_metro,
      freshman_housing: bio[0].freshman_housing,
      gpa: bio[0].average_gpa,
    },
  };

  console.log(school);
  return school;
}
