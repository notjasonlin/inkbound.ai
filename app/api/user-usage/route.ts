// app/api/user-usage/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: usage, error } = await supabase
    .from("user_usage")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(usage);
}

// Send in ai, school, template as type parameters to use
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch user usage data
  const { data: usage, error: usageError } = await supabase
    .from("user_usage")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (usageError || !usage) {
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 },
    );
  }

  const { type } = await request.json();

  // Determine which field to update based on the type
  let updatedField;
  if (type === "ai") {
    updatedField = { ai_calls_used: usage.ai_calls_used + 1 };
  } else if (type === "school") {
    updatedField = { schools_sent: usage.schools_sent + 1 };
  } else if (type === "template") {
    updatedField = { templates_used: usage.templates_used + 1 };
  } else {
    return NextResponse.json(
      { error: "Failed to update data"  },
      { status: 400 },
    );
  }

  // Perform the update
  const { error: updateError } = await supabase
    .from("user_usage")
    .update(updatedField)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error("Failed to update data" );
  }

  return NextResponse.json({ success: true });
}
