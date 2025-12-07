export async function generatePlan(userProfile) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock plan data
  return {
    topic: userProfile.topic,
    days: [
      {
        id: 'day-1',
        title: 'Day 1: Foundations',
        steps: [
          { id: 'd1-s1', title: 'Introduction Video', type: 'video', duration: '15m', url: '#', completed: false },
          { id: 'd1-s2', title: 'Core Concepts Article', type: 'article', duration: '10m', url: '#', completed: false },
          { id: 'd1-s3', title: 'Quick Quiz', type: 'quiz', duration: '5m', completed: false },
        ]
      },
      {
        id: 'day-2',
        title: 'Day 2: Deep Dive',
        steps: [
          { id: 'd2-s1', title: 'Advanced Tutorial', type: 'video', duration: '20m', url: '#', completed: false },
          { id: 'd2-s2', title: 'Practice Exercise', type: 'exercise', duration: '30m', completed: false },
        ]
      },
      {
        id: 'day-3',
        title: 'Day 3: Application',
        steps: [
          { id: 'd3-s1', title: 'Build a mini-project', type: 'project', duration: '1h', completed: false },
        ]
      }
    ]
  };
}
