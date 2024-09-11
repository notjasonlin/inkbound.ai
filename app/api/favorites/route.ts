import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const supabase = createClient();
    const url = new URL(req.url);
    const userId = url.searchParams.getAll('userId');

    console.log("USERID", userId);

    try {
        const { data, error } = await supabase
        .from("favorite_schools")
        .select("data")
        .eq("uuid", userId)
        .single();

    if (error) {
        console.error("Error fetching user credits:", error);
        return NextResponse.json({ error: "Failed to fetch credits" }, {
            status: 500,
        });
    }

    return NextResponse.json({ credits: data?.data || 0 });
    } catch (e) {

    }
    
}

export async function POST(req: Request) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, {
            status: 401,
        });
    }

    const { data, error } = await supabase
        .from("favorite_schools")
        .update({ data: req.formData() })
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) {
        console.error("Error updating favorite schools:", error.message);
    } else {
        console.log("Updated favorite school:", data);
    }
}
