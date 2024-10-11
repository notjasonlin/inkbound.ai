import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { useRouter } from 'next/router';
import SchoolContent from '../app/dashboard/schools/[school]/components/SchoolContent';
import { SchoolData } from '../types/school';
import { createClient } from '@supabase/supabase-js';
import '@testing-library/jest-dom';

// Add these lines at the top of the file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tvjclbhclyozgziixpcp.supabase.co/";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2amNsYmhjbHlvemd6aWl4cGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUxMzI3NjIsImV4cCI6MjA0MDcwODc2Mn0.pXXAk6UADtwqU4JBho12F5OXStrvTG8pqk87xPiRvcg';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('All School Pages', () => {
  let allSchools: SchoolData[];

  beforeAll(async () => {
    // Fetch all schools from Supabase
    const { data, error } = await supabase.from('school').select('*');
    if (error) throw error;
    allSchools = data as SchoolData[];
  });

  beforeEach(() => {
    (useRouter as jest.Mock).mockImplementation(() => ({
      query: { school: 'test-university' },
    }));
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all school pages with content', () => {
    allSchools.forEach((school) => {
      render(<SchoolContent schoolData={school} userID="test-user-id" />);

      // Check if the school name is rendered
      expect(screen.getByText(school.school)).toBeInTheDocument();

      // Check if division, state, and conference are rendered
      expect(screen.getByText(school.division)).toBeInTheDocument();
      expect(screen.getByText(school.state)).toBeInTheDocument();
      expect(screen.getByText(school.conference)).toBeInTheDocument();

      // Check if coach information is rendered
      school.coaches.forEach((coach) => {
        expect(screen.getByText(coach.name)).toBeInTheDocument();
        expect(screen.getByText(coach.email)).toBeInTheDocument();
        expect(screen.getByText(coach.position)).toBeInTheDocument();
      });
    });
  });
});

test('renders SchoolContent component', () => {
  // Mock SchoolData object
  const school: SchoolData = {
    id: '1',
    school: 'Sample School',
    coaches: [],
    division: 'Division 1',
    state: 'State',
    conference: 'Conference',
    // Add other required properties here
  };

  const { getByText } = render(
    <SchoolContent schoolData={school} userID="test-user-id" />
  );
  expect(getByText(/some text/i)).toBeInTheDocument();
});
