// import React, { useState, useEffect } from 'react';
// import { CoachData, SchoolData } from '@/types/school/index';
// import { createClient } from "@/utils/supabase/client";

// interface AddSchoolModalProps {
//   onAddSchool: (school: SchoolData) => void;
//   onClose: () => void;
// }

// interface CoachInformation {
//   id: string,
//   school: string,
//   confrence: string,
//   division: string,
//   state: string,
//   name: string,
//   position: string,
//   email: string,
// }

// const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ onAddSchool, onClose }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [unfiltered, setUnfiltered] = useState<CoachInformation[]>([]); // to account for duplicate entries of a school, containing different coach info
//   const [searchResults, setSearchResults] = useState<CoachInformation[]>([]);
//   const [allSchools, setAllSchools] = useState<CoachInformation[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const supabase = createClient();

//   useEffect(() => {
//     fetchAllSchools();
//   }, []);

//   const fetchAllSchools = async () => {
//     setIsLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('coachinformation')
//         .select('*');

//       if (error) throw error;


//       setAllSchools(data || []);
//     } catch (error) {
//       console.error('Error fetching schools:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSearch = () => {
//     console.log(allSchools);

//     const uniqueSchools = new Set<string>();
//     const copies: CoachInformation[] = [];

//     const filtered = allSchools.filter(school => {
//       const schoolNameLower = school.school.toLowerCase();
//       if (schoolNameLower.includes(searchQuery.toLowerCase())) {
//         console.log("ENTER");
//         copies.push(school);
//         if (!uniqueSchools.has(schoolNameLower)) {
//           uniqueSchools.add(schoolNameLower);
//           return true;
//         }
//       }
//       return false;
//     });
//     setUnfiltered(copies);
//     setSearchResults(filtered);
//   };


//   const handleSelectSchool = async (school: CoachInformation) => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error('User not authenticated');

//       const schoolData: SchoolData = makeSchoolData(school);

//       const { data: existingFavorites, error: fetchError } = await supabase
//         .from('favorite_schools')
//         .select('data')
//         .eq('uuid', user.id)
//         .single();

//       if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

//       let updatedFavorites: SchoolData[];
//       if (existingFavorites) {
//         updatedFavorites = [...existingFavorites.data, school];
//       } else {
//         updatedFavorites = [schoolData];
//       }

//       const { error: upsertError } = await supabase
//         .from('favorite_schools')
//         .upsert({ uuid: user.id, data: updatedFavorites }, { onConflict: 'uuid' });

//       if (upsertError) throw upsertError;

//       onAddSchool(schoolData);
//       onClose();
//     } catch (error) {
//       console.error('Error adding school to favorites:', error);
//       // Optionally, show an error message to the user
//     }
//   };

//   const makeSchoolData = (school: CoachInformation) => {
//     console.log("UNFILTERED", unfiltered);


//     const allData = unfiltered.filter(datum => datum.school === school.school);

//     const coaches: CoachData[] = [];
//     allData.map(datum => coaches.push({ name: datum.name, email: datum.email, position: datum.position }));

//     return {
//       id: school.id,
//       school: school.school,
//       coaches,
//       division: school.division,
//       state: school.state,
//       conference: school.confrence
//     }
//   }

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//       <div className="bg-white w-96 p-6 rounded shadow-lg">
//         <h3 className="text-lg font-semibold mb-4">Add a New School</h3>
//         <input
//           type="text"
//           className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
//           placeholder="Search for a school..."
//           value={searchQuery}
//           onChange={e => setSearchQuery(e.target.value)}
//         />
//         <button
//           onClick={handleSearch}
//           className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-4"
//           disabled={isLoading}
//         >
//           {isLoading ? 'Loading...' : 'Search'}
//         </button>
//         <div className="max-h-60 overflow-y-auto">
//           {searchResults.length > 0 ? (
//             <ul className="space-y-2">
//               {searchResults.map(school => {
//                 return (
//                   <li
//                     key={school.id}
//                     className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
//                     onClick={() => handleSelectSchool(school)}
//                   >
//                     {school.school}
//                   </li>
//                 )
//               }
//               )}
//             </ul>
//           ) : (
//             <p className="text-gray-600">
//               {isLoading ? 'Loading schools...' : 'No results found.'}
//             </p>
//           )}
//         </div>
//         <button
//           onClick={onClose}
//           className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AddSchoolModal;

