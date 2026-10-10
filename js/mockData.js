/**
 * CampusCare Master Taxonomy Layer
 */

export const INITIAL_USERS = [
  {
    id: 'usr_student_1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    role: 'student',
    rollNo: '2024CS108',
    department: 'Computer Science',
    hostel: 'Hostel Block B (Cauvery)',
    roomNo: 'B-312'
  },
  {
    id: 'usr_staff_1',
    name: 'Suresh Kumar',
    email: 'suresh.maintenance@campus.edu',
    role: 'staff',
    department: 'Electrical & HVAC Maintenance'
  },
  {
    id: 'usr_admin_1',
    name: 'Dr. Ramesh Patel',
    email: 'warden.cauvery@campus.edu',
    role: 'admin',
    department: 'Chief Warden Office'
  }
];

export const CAMPUS_LOCATIONS = [
  'Hostel Block B (Cauvery)',
  'Hostel Block A (Ganga)',
  'Central Library (2nd Floor)',
  'Central Library (Ground Floor)',
  'Main Canteen & Food Court',
  'Science Block (Physics Labs)',
  'Tech Park (CS Labs)',
  'Seminar Hall 3 (Auditorium)',
  'Campus Main Gate & Perimeter',
  'Indoor Sports Complex',
  'Mechanical Engg Workshop',
  'Admin Block (Ground Floor)'
];

export const CATEGORIES = [
  { id: 'electrical', name: 'Electrical & Power', icon: '⚡', department: 'Electrical & HVAC Maintenance' },
  { id: 'hvac', name: 'AC & Ventilation', icon: '❄️', department: 'Electrical & HVAC Maintenance' },
  { id: 'wifi', name: 'Wi-Fi & Network', icon: '📶', department: 'IT & Network Infrastructure' },
  { id: 'plumbing', name: 'Plumbing & Water', icon: '🚰', department: 'Plumbing & Sanitation' },
  { id: 'furniture', name: 'Furniture & Carpentry', icon: '🪑', department: 'Estate & Civil Works' },
  { id: 'sanitation', name: 'Sanitation & Cleanliness', icon: '🧹', department: 'Plumbing & Sanitation' },
  { id: 'classroom_av', name: 'Classroom AV & Projector', icon: '📽️', department: 'IT & Network Infrastructure' },
  { id: 'security', name: 'Safety & Streetlights', icon: '🛡️', department: 'Campus Security & Electrical' }
];

const SAMPLE_AUDIO = 'data:audio/wav;base64,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fn6GhHFgZ4uwsIVNOl+hyrZ3QD5vpriccVxmfoqFfoSSkXpbVHSmv6NmOUR/usWYW0BYiqqjhG1teoB5dICXooxjSFmPvryHSjdensKveVBRc5adjHt5gIByZ3KSrKN3SkRwrMamZzxIfrC2kmdXaISQiYCCi4l1Xl+AqraTWjtTj8C8iFBBY5avn3xmanuEf3qDlJiCX1Bomryud0M/b6rBo2xKVX6en4l1c3x+dW96laWWbUpRgLS/llo8VI23sYZdVW6LlYt+foWDc2NqiqqrhFNCY53BsHhIRnChsZlzYGl+iYR+hI+Pel9ZdaG3n2lBS3+zvZVfR12JpZ+Eb296gHp2gJSdi2ZOXo22tIZQP2Kauql6VVZ1k5mLe3mAgHRqc4+mn3hQS3KnvqJqRE5+qrCQalxrg46IgIKKiHZiY4Clr5FfQ1iOuLWHVUhnk6mcfGlse4N/e4OSlYJjVWuXtah4SkdxpbmfblBafpqbiHZ1fH93cXuSoZRvUFaArbeTXkNZi7CrhmFacIqTin9+hIN0Z2yIpaWEWElmmrmqeU5Ncp2rlnRjbH6Hg36DjY17Y113nbCbbElRf621kmNOYYegm4NxcXuAe3eAkpqJaVRii7CuhVZHZZezpHtaW3aRlol8eoB/dWx1jqKbeVVRc6K2nmxLVH6lqo5sYG2DjId/gYiHd2VmgKCpj2NKXYyxroZaT2qRpJh9a258g397go+TgWZabZSvo3hRTXKhsptwVl5+l5iHd3Z9f3hye5CdkXFWW4CosZFiSl6KqqaFZV5xiZCIf36EgnVpb4egoYNdT2mWsqV5VFN0mqaTdmdufoaDfoOMjHtmYXiaq5huT1Z/qK+QZlRkhpyYg3Jye4B7eICQl4hrWWWKqqmEWk5olK2ge19fd4+UiHx7gH92b3aMnph6WlZ1nrCablFZfqGljG5kcIKLhn+Bh4Z4aGmAnKSNZlFhiqyphV5UbI+glX1ucHyCf3yCjpCBaV5vkqmfeVZTdJ2smHJaYn6UlYZ4d31/eHR8jpmPcltfgKOrj2VRYYmlooRoYnOHjod/foOCd2xxhpydg2FVa5SsoHpZWHWWoZF3anB+hoJ+goqKfGlleJemlXBVW3+jqY5pWWeGmZWCdHR8gHx5gI6Uh25eaImlpIRfU2uSp5x8YmN4jZGHfHuAf3dwd4qalXpfW3abqpdwVl5+naGLcGdxgomFf4GGhXlrbICZoItpVmSJpqSEYllujZyTfXByfIJ/fIKMjoFsYnGQpJt6W1h1maeVc19mfpKThXl4fX95dXyMlo10X2OAn6aNaFZlh6GdhGpmdIaNhn9+g4F4bnKFmZmCZFpukaede11cdpSdj3hscn6Fgn6CiYl8bGh5lKGSclpff5+kjGxdaoWWkoJ1dXx/fHmAjJGGcGJriKGfg2JYbZCjmXxmZnmLj4Z9fIB/eHJ4iZeSe2Jfd5ellHJbYX6ZnYlyanOCiIR/gYaEeW1ugJacimtbZ4iin4RmXnCLmZB9cXR9gX99gYqMgW5mc46gmHpfXXaWopJ1Y2l+kJCEenl9f3p2fIuUi3VjZoCboYtrW2iGnZqDbWl2houFf3+CgXhwdIWWloJoXnCPopl7YWB3kZqNeW5zf4SCf4GIiHxua3qRnZBzXmN/m6CLbmFthJOQgXZ2fX98en+Kj4VyZW2HnZyDZl1wjp+WfGlpeoqNhX18f395dHmIlJB7ZmN4lKGSdF9lf5aZiHRsdIGHhH+AhYR6b3CAk5mIbl9qh56cg2licoqWjn5zdX2Bf32BiYuAcGl0jJyVe2Nhd5OekHZma36OjoR6eX5/end9iZGKdmZpf5idim1fa4aZl4Nva3eFioV/f4KBeXJ1hJOUgWpico2elnxlZHiPl4t5cHV/hIF/gYeHfXBteo+ZjnViZn+YnIlwZW+EkY6Bd3d9f317f4mNhXNob4aZmIJpYXGMm5N9a2x6iIuFfXx/f3p1eoeSjnxpZnmSnY91Y2h/k5aHdW52gYaDf4CEg3txcoCRlodwY22GmpiDa2V0iZOMfnR2fYF/fYGIiYBya3WKmZJ7ZmR4kZuOd2lufoyMg3t6fn97eH2Ij4l3aWx/lZqJb2NthZaUgnFueISIhH9/gYF6c3aDkZGBbWVzjJqTfGhneY2Uinpydn+DgX+BhoZ9cm97jZaMdmVpf5WZiHJocYOPjIF4eH1/fXt/iIyEdWtxhZaVgmtlc4qYkX1ubnuHioR9fX9/enZ6ho+MfGtpepCZjnZma3+Rk4Z2cHeBhYN/gIODe3NzgI+ThnJmb4WXlYJuaHWHkYt+dnd9gX99gYeIgHNud4mWkHxpaHmPl4x4a3B+iouDe3t+f3t5fYeNiHhsbn+SlodxZm+Ek5GCc3B5hIeDf3+BgHp1d4OPj4FvaHWKl5F8a2p6jJGIe3R3f4OBf4GFhX1zcXuMlIt3aGx/kpaHc2tyg42LgXl5fX99fH+HioN2bXOEk5OCbmh0iZWOfXBwe4aJg359f397d3uFjot8bmx6jpaMd2ltf4+RhXdyeIGEgn+Ag4J8dHV/jZGFc2lxhJSTgnBrdoaPiX53eH6Af36AhoeAdXB4iJOOfGxqeo2Ui3lucX+JiYJ8e35/fHp9houHeW5wf5CUhnNpcYSRj4F0cXmDhoN/f4GAe3Z4go2NgXFrdomUj31tbHqKj4d7dXh/goF/gYSEfXVzfIqRiXhrbn+Qk4Z1bXSCi4mBenp+f318f4aJg3dvdISRkIFwanaIko19cXJ8hoiDfn1/f3t4e4SMiX1wbnuMk4p4bG9/jY+FeHR5gISCf4CCgnx2dn+Lj4V1bHKEkpCBcW13ho2Ifnh5foB/foCFhoB2cXiHkYx9bm16i5KJeXBzf4iIgnx8fn98en6FioZ6cHJ/jpGGdGxzg4+NgXVzeoOFgn9/gYB7d3mCi4uAcm13iJKNfW9ve4mNhnx2eX+CgH+AhIR+dnR8iY+IeW1wf46RhXZvdYKKiIB6en5/fnx/hYiCeHF2g4+OgXJtd4eQi35zc3yFh4J+fX9/fHl8hIqIfXJwe4qRiXlucX+LjYR5dXmAg4J/gIKCfHd3f4qNhHZudIOPjoFzb3iFi4d+eXp+gH9+gISFgHdzeYaOi31wb3uKkIh6cnR/h4eCfXx+f317foSJhXpyc3+Mj4V2bnSDjYyBdnR7goWCf3+BgHx4eoKKioB0cHiHkIt9cXF7iIyGfHd5f4GAf4CDg353dX2IjYd5b3J/jI+Fd3F2gYmHgHt7fn9+fX+Eh4J5c3eDjY2Bc294ho6KfnR1fISGgn5+f398enyDiYd9c3J8iY+IenBzf4qLg3p2eoCDgX+AgoF9eHh/iYuDd3B1g42NgXRxeYSKhn55en6Af36AhIWAeHR6hY2JfXJxe4mOh3tzdn+GhoF9fH5/fXt+hIiEe3N1f4uNhHdwdYKLioF3dnuChIJ/f4CAfHl6gYmJgHVxeYaOin1zcnyHioV8eHp/gYB/gIODfnh2fYeMhnpxc3+LjYR4c3eBh4aAe3t+f359f4SGgnl0eIKLi4F1cXmFjIh+dnZ9g4WCfn5/f3x6fIOIhn10c3yIjYd6cnR/iYqDend7gIKBf4CBgX14eX+HioN4cnaCjIuBdnN6hIiFfnp7foB/foCDhIB5dnuEi4h9c3J8iIyGe3V3f4WFgX19fn99fH6Dh4R7dXZ/iYyEeHJ3goqJgHh3fIGDgX9/gIB9enuBh4iAdnN5hYyJfnR0fIaJhH15e3+BgH+AgoJ+eXd9hoqFe3N1f4mLg3l0eIGGhYB8fH5/fn1/g4WBenV4goqKgHZyeYSLh353d32DhIF+fn9/fXt9goeFfnZ1fIeLhntzdX+HiYJ7eHuAgoF/gIGBfXl5f4aIgnlzd4KKioB3dHqDh4V+e3t+gH9+gIODf3l3e4SKh351dHyHioV8dnh/hIWBfX1+f318foOGg3x2d3+IioN5c3iBiYiAeXh8gYOBf3+AgH16e4GGh4B3dHqEiod+dXV8hYiDfXp7f4GAf4CCgn55eH2FiYV7dHY=';

export const INITIAL_COMPLAINTS = [
  {
    id: 'CMP-8012',
    title: 'Severe AC Chiller Leakage & Water Pooling in Corridor',
    description: 'The main HVAC compressor split unit is leaking excessive water onto the hallway floor creating an electrocution and slip hazard. Immediate maintenance requested.',
    category: 'AC & Ventilation',
    categoryId: 'hvac',
    location: 'Hostel Block B (Cauvery)',
    specificSpot: 'Room B-312 (3rd Floor Corridor)',
    status: 'In Progress',
    priority: 'High',
    upvotes: 14,
    upvotedBy: ['usr_student_2', 'usr_student_3'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    submittedBy: {
      id: 'usr_student_1',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.edu',
      rollNo: '2024CS108'
    },
    assignedTo: {
      id: 'usr_staff_1',
      name: 'Suresh Kumar',
      department: 'Electrical & HVAC Maintenance'
    },
    photoUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
    audioUrl: null,
    resolutionProof: null,
    timeline: [
      { step: 'Submitted', title: 'Complaint Registered', description: 'Student submitted issue with photo evidence.', actor: 'Aarav Sharma', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() },
      { step: 'Acknowledged', title: 'Triaged by Warden AI', description: 'Priority upgraded to High due to hallway hazard.', actor: 'UniVerse AI', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { step: 'Assigned', title: 'Assigned to HVAC Team', description: 'Work order dispatched to Suresh Kumar.', actor: 'Admin Desk', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() },
      { step: 'In Progress', title: 'Technician on Site', description: 'Inspecting evaporator drain pipe.', actor: 'Suresh Kumar', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() }
    ],
    comments: [
      { id: 'c_1', author: 'Suresh Kumar', role: 'staff', text: 'Arrived with replacement drain pipe fittings. Will complete repair before 4 PM.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() }
    ]
  },
  {
    id: 'CMP-9104',
    title: 'Substation Transformer Humming & Corridor Sparking',
    description: 'High-voltage humming and occasional intermittent sparking noticed near the basement switchboard. Attached voice note describes the sound pattern.',
    category: 'Electrical & Power',
    categoryId: 'electrical',
    location: 'Science Block (Physics Labs)',
    specificSpot: 'Basement Junction Room 04',
    status: 'Assigned',
    priority: 'Critical',
    upvotes: 23,
    upvotedBy: ['usr_student_4', 'usr_student_5'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    submittedBy: {
      id: 'usr_student_1',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.edu',
      rollNo: '2024CS108'
    },
    assignedTo: {
      id: 'usr_staff_1',
      name: 'Suresh Kumar',
      department: 'Electrical & HVAC Maintenance'
    },
    photoUrl: null,
    audioUrl: SAMPLE_AUDIO,
    resolutionProof: null,
    timeline: [
      { step: 'Submitted', title: 'Complaint Registered', description: 'Recorded student voice note attached to ticket.', actor: 'Aarav Sharma', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
      { step: 'Acknowledged', title: 'Safety Escalation Triggered', description: 'Tagged Critical priority for electrical hazard.', actor: 'System Auto-Triage', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() },
      { step: 'Assigned', title: 'Dispatched to Senior Electrician', description: 'Assigned to Suresh Kumar for emergency inspection.', actor: 'Duty Officer', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }
    ],
    comments: [
      { id: 'c_2', author: 'Dr. Ramesh Patel', role: 'admin', text: 'Main isolator in Room 04 has been cordoned off as precaution. Suresh, please report findings ASAP.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() }
    ]
  },
  {
    id: 'CMP-7421',
    title: 'Wi-Fi Access Point 5GHz Packet Drops & Disconnections',
    description: 'Aruba AP in Lab 402 disconnects student laptops every 4 minutes during laboratory practicals. High packet drop and DNS timeout.',
    category: 'Wi-Fi & Network',
    categoryId: 'wifi',
    location: 'Tech Park (CS Labs)',
    specificSpot: 'Lab 402 (Software Engg Lab)',
    status: 'Acknowledged',
    priority: 'Medium',
    upvotes: 9,
    upvotedBy: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    submittedBy: {
      id: 'usr_student_6',
      name: 'Priya Verma',
      email: 'priya.v@campus.edu',
      rollNo: '2023IT044'
    },
    assignedTo: null,
    photoUrl: null,
    audioUrl: null,
    resolutionProof: null,
    timeline: [
      { step: 'Submitted', title: 'Complaint Registered', description: 'Ticket submitted via student portal.', actor: 'Priya Verma', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { step: 'Acknowledged', title: 'Network NOC Notified', description: 'AP controller syslog monitoring enabled.', actor: 'IT Helpdesk', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() }
    ],
    comments: []
  },
  {
    id: 'CMP-6190',
    title: 'Broken Wooden Desks & Hazardous Exposed Screws',
    description: 'Two study table tops have detached from the steel frames with sharp protruding screws. Needs carpentry reinforcement.',
    category: 'Furniture & Carpentry',
    categoryId: 'furniture',
    location: 'Central Library (2nd Floor)',
    specificSpot: 'Quiet Study Bay 14',
    status: 'Submitted',
    priority: 'Low',
    upvotes: 5,
    upvotedBy: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    submittedBy: {
      id: 'usr_student_7',
      name: 'Karan Singh',
      email: 'karan.s@campus.edu',
      rollNo: '2024ME019'
    },
    assignedTo: null,
    photoUrl: null,
    audioUrl: null,
    resolutionProof: null,
    timeline: [
      { step: 'Submitted', title: 'Complaint Registered', description: 'Queued for estate carpentry routine batch.', actor: 'Karan Singh', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() }
    ],
    comments: []
  },
  {
    id: 'CMP-5523',
    title: 'Low Water Pressure in West Wing Restrooms',
    description: 'Overhead tank booster pump tripping; water flow in taps is barely a trickle during peak morning hours.',
    category: 'Plumbing & Water',
    categoryId: 'plumbing',
    location: 'Hostel Block A (Ganga)',
    specificSpot: '3rd Floor Restrooms',
    status: 'Resolved',
    priority: 'Medium',
    upvotes: 18,
    upvotedBy: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    submittedBy: {
      id: 'usr_student_8',
      name: 'Neha Gupta',
      email: 'neha.g@campus.edu',
      rollNo: '2022EC081'
    },
    assignedTo: {
      id: 'usr_staff_2',
      name: 'Rajesh Plumber',
      department: 'Plumbing & Sanitation'
    },
    photoUrl: null,
    audioUrl: null,
    resolutionProof: 'Booster pump circuit breaker replaced and line bled. Full water pressure restored.',
    timeline: [
      { step: 'Submitted', title: 'Complaint Registered', description: 'Water pressure reported.', actor: 'Neha Gupta', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
      { step: 'Acknowledged', title: 'Acknowledged', description: 'Plumbing supervisor notified.', actor: 'Hostel Caretaker', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString() },
      { step: 'Assigned', title: 'Work Order Dispatched', description: 'Assigned to Rajesh.', actor: 'Sanitation Dept', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { step: 'In Progress', title: 'Pump Maintenance', description: 'Testing motor coil & air valve.', actor: 'Rajesh Plumber', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString() },
      { step: 'Resolved', title: 'Resolved & Tested', description: 'Pressure tested at 2.4 bar.', actor: 'Rajesh Plumber', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() }
    ],
    comments: [
      { id: 'c_3', author: 'Rajesh Plumber', role: 'staff', text: 'Pump pressure verified across all 6 stalls. Operational.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() }
    ]
  }
];
