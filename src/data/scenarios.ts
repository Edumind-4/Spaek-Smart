import { Scenario, Category } from '../types';

export const SCENARIOS: Scenario[] = [
  // TRAVEL
  {
    id: 'travel-immigration',
    category: 'Travel',
    title: 'Passing Immigration',
    icon: 'Plane',
    userObjective: 'Explain your travel plans, duration of stay, and accommodation to the officer.',
    aiPersona: 'You are a professional but stern immigration officer at London Heathrow. Ask about the purpose of the trip, where the traveler is staying, and how they will fund themselves. Be slightly suspicious to encourage detail.',
    startMessage: 'Next in line, please. Passport and landing card? What is the purpose of your visit to the UK?'
  },
  {
    id: 'travel-hotel',
    category: 'Travel',
    title: 'Hotel Complaint',
    icon: 'Hotel',
    userObjective: 'Complain about a noisy room and a broken air conditioner to get a room change or discount.',
    aiPersona: 'You are a busy hotel receptionist at a 4-star hotel. You are polite but the hotel is almost fully booked. Only offer a room change if the user is persistent.',
    startMessage: 'Good evening. How can I help you? I hope you are enjoying your stay with us.'
  },
  // WORKPLACE
  {
    id: 'work-raise',
    category: 'Workplace',
    title: 'Asking for a Raise',
    icon: 'DollarSign',
    userObjective: 'Discuss your achievements and convince your manager you deserve a 10% salary increase.',
    aiPersona: 'You are a fair but budget-conscious manager. You acknowledge the user\'s hard work but emphasize that the company is watching its expenses closely this quarter.',
    startMessage: 'Hi there, thanks for meeting with me. You mentioned you wanted to discuss your performance and compensation?'
  },
  {
    id: 'work-deadline',
    category: 'Workplace',
    title: 'Missing a Deadline',
    icon: 'Clock',
    userObjective: 'Explain why a major project will be late and propose a new timeline to your impatient boss.',
    aiPersona: 'You are an impatient and direct boss. This project is critical for a big client. You are not happy about the delay. Demand a very specific recovery plan.',
    startMessage: 'I just checked the shared drive and the project files aren\'t there. We discussed the deadline was today. What happened?'
  },
  // SHOPPING
  {
    id: 'shopping-return',
    category: 'Shopping',
    title: 'Returning a Blender',
    icon: 'ShoppingBag',
    userObjective: 'Return a defective blender you bought yesterday. You lost the receipt but have a bank statement.',
    aiPersona: 'You are a store clerk following strict policy. Usually, you need a physical receipt for a full refund. You can offer store credit easily, but a refund requires convincing.',
    startMessage: 'Hi! Welcome to HomeAppliance Co. Are you looking to buy something today, or is this a return?'
  },
  {
    id: 'shopping-tailor',
    category: 'Shopping',
    title: 'At the Tailor',
    icon: 'Scissors',
    userObjective: 'Explain exactly how you want your suit/dress altered for a wedding next week.',
    aiPersona: 'You are an expert, slightly opinionated tailor. You want the best fit, but the user\'s deadline is very tight. Suggest some adjustments they might not have thought of.',
    startMessage: 'Stand up straight on the platform, please. Now, tell me, where specifically does this feel uncomfortable?'
  },
  // SOCIAL
  {
    id: 'social-party',
    category: 'Social',
    title: 'Small Talk at a Party',
    icon: 'PartyPopper',
    userObjective: 'Start a conversation with a stranger, find a common interest, and keep the talk going for 5 minutes.',
    aiPersona: 'You are a friendly, outgoing person named Alex at a mutual friend\'s birthday party. You work in graphic design and love hiking.',
    startMessage: 'The music is great here, isn\'t it? I don\'t think we\'ve met before. I\'m Alex, a friend of Sarah\'s.'
  },
  {
    id: 'social-neighbor',
    category: 'Social',
    title: 'Noisy Neighbor',
    icon: 'Home',
    userObjective: 'Politely but firmly ask your neighbor to turn down their music as you have an early flight.',
    aiPersona: 'You are a slightly defensive but ultimately reasonable neighbor who didn\'t realize how thin the walls were. You just got a new sound system.',
    startMessage: 'Oh, hey! Is the music too loud? I was just testing out these new speakers I got today.'
  },
  // EMERGENCIES
  {
    id: 'emergency-flat',
    category: 'Emergencies',
    title: 'Reporting a Flat Tire',
    icon: 'Car',
    userObjective: 'Call roadside assistance, explain your location, and describe the problem with your car.',
    aiPersona: 'You are a 24/7 roadside assistance operator. You are efficient and need precise information to send a tow truck.',
    startMessage: 'Roadside Assistance, this is Mark. Please state your location and the nature of your emergency.'
  },
  {
    id: 'emergency-lost-wallet',
    category: 'Emergencies',
    title: 'Lost Wallet at Station',
    icon: 'Frown',
    userObjective: 'Report your lost wallet to the transit police, listing its contents and where you last saw it.',
    aiPersona: 'You are a transit police officer. You need a detailed description of the item and the timeline of events to file an official report.',
    startMessage: 'Loss prevention, Officer Miller speaking. When did you first notice the item was missing?'
  }
];

export const CATEGORIES: { name: Category; emoji: string; color: string }[] = [
  { name: 'Travel', emoji: '✈️', color: '#3B82F6' },
  { name: 'Workplace', emoji: '💼', color: '#10B981' },
  { name: 'Shopping', emoji: '🛒', color: '#F59E0B' },
  { name: 'Social', emoji: '🗣️', color: '#8B5CF6' },
  { name: 'Emergencies', emoji: '🚨', color: '#EF4444' }
];
