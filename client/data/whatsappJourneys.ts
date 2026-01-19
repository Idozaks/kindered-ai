export interface JourneyStep {
  text: string;
  trainerNote?: string;
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  steps: JourneyStep[];
}

export const whatsappJourneys: Journey[] = [
  {
    id: "read-message",
    title: "Read a Message",
    description: "Learn to open and read messages",
    steps: [
      {
        text: "Find the WhatsApp icon on your home screen. It is green with a white telephone. Tap it once.",
        trainerNote: "Help them locate the icon if needed.",
      },
      {
        text: "You are now on Chats. This is your list of conversations.",
        trainerNote: "Point out familiar names in the list.",
      },
      {
        text: "Look for the person's name. If you see a small number or dot next to it, there is a new message.",
        trainerNote: "The number shows how many unread messages.",
      },
      {
        text: "Tap their name once.",
        trainerNote: "Wait for the conversation to open.",
      },
      {
        text: "New messages are at the bottom of the screen. Slide your finger up to see older messages.",
        trainerNote: "Demonstrate the scrolling motion slowly.",
      },
      {
        text: "Tap the back arrow at the top-left to return to the list of chats.",
        trainerNote: "On some phones, you can also swipe right.",
      },
    ],
  },
  {
    id: "send-text",
    title: "Send a Text Message",
    description: "Write and send a simple message",
    steps: [
      {
        text: "Open WhatsApp and go to Chats.",
        trainerNote: "Same as Journey 1, Step 1.",
      },
      {
        text: "To reply, tap the person's name. To start a new chat, tap the green message button, then tap the person's name.",
        trainerNote: "The button may look like a speech bubble or plus sign.",
      },
      {
        text: "At the bottom, tap the long white box. The keyboard appears.",
        trainerNote: "This is the message input area.",
      },
      {
        text: 'Type a short message, for example: "Hello, I can see your message."',
        trainerNote: "Help with typing if needed.",
      },
      {
        text: "Tap the green send arrow or paper airplane.",
        trainerNote: "It's on the right side of the text box.",
      },
      {
        text: "Your message appears on the right side of the screen. That means it was sent.",
        trainerNote: "Blue ticks mean it was read.",
      },
    ],
  },
  {
    id: "send-photo",
    title: "Send a Photo",
    description: "Share photos with family and friends",
    steps: [
      {
        text: "Open the chat with the person you want to send a photo to.",
        trainerNote: "Same as starting a conversation.",
      },
      {
        text: "Tap the paperclip or plus (+) next to the typing box.",
        trainerNote: "This opens the attachment menu.",
      },
      {
        text: "To take a new photo: Tap Camera.",
        trainerNote: "For existing photos, see next steps.",
      },
      {
        text: "Point the camera and tap the big round button to take the picture.",
        trainerNote: "Hold the phone steady.",
      },
      {
        text: "If you like the photo, tap the green Send arrow. If not, tap X or Back and try again.",
        trainerNote: "You can also add a caption before sending.",
      },
      {
        text: "To send an existing photo: Tap the paperclip/plus again, then tap Gallery or Photos.",
        trainerNote: "This shows your saved photos.",
      },
      {
        text: "Tap the picture you want, then tap Send.",
        trainerNote: "You can select multiple photos.",
      },
    ],
  },
  {
    id: "video-call",
    title: "Make a Video Call",
    description: "See and talk to someone face-to-face",
    steps: [
      {
        text: "Open WhatsApp and go to Chats.",
        trainerNote: "Make sure you have good internet.",
      },
      {
        text: "Tap the name of the person you want to see.",
        trainerNote: "Open their conversation.",
      },
      {
        text: "At the top-right, tap the video camera icon.",
        trainerNote: "It looks like a small camera.",
      },
      {
        text: "Wait while it rings. You will see your face on the screen.",
        trainerNote: "Check that the camera shows your face clearly.",
      },
      {
        text: "When they answer, you will both see each other. Speak normally.",
        trainerNote: "Hold the phone at arm's length for best view.",
      },
      {
        text: "To end the call, tap the red phone button.",
        trainerNote: "It's usually at the bottom of the screen.",
      },
    ],
  },
  {
    id: "family-groups",
    title: "Family Groups & Safety",
    description: "Use groups safely and wisely",
    steps: [
      {
        text: "On Chats, group conversations show more than one person. Tap the group name to open it.",
        trainerNote: "Groups often have a family name or photo.",
      },
      {
        text: "Anything you write in this group is seen by everyone in the group.",
        trainerNote: "Emphasize this is not private.",
      },
      {
        text: "Use the typing box and send button like a normal chat.",
        trainerNote: "Same process as sending a regular message.",
      },
      {
        text: "Do not share personal details like ID numbers, bank details, or passwords.",
        trainerNote: "Even in family groups, be careful.",
      },
      {
        text: "Be careful with links that talk about prizes or special offers. Ask family before tapping.",
        trainerNote: "Scammers often use tempting offers.",
      },
      {
        text: "If someone in the group makes you uncomfortable, tell a family member or helper.",
        trainerNote: "They can help remove that person.",
      },
    ],
  },
  {
    id: "privacy-settings",
    title: "Privacy Settings",
    description: "Control who can see your information",
    steps: [
      {
        text: "In WhatsApp, tap the three dots (top-right), then tap Settings. On iPhone, tap Settings at the bottom.",
        trainerNote: "Guide to the Settings menu.",
      },
      {
        text: "Tap Privacy.",
        trainerNote: "This controls who sees your info.",
      },
      {
        text: "Tap Profile photo and choose My contacts.",
        trainerNote: "Only people you know will see your photo.",
      },
      {
        text: "Tap Last seen and online and choose My contacts or Nobody.",
        trainerNote: "This hides when you were online.",
      },
      {
        text: "Tap Groups and choose My contacts so only your contacts can add you to groups.",
        trainerNote: "Prevents strangers from adding you.",
      },
      {
        text: "If unknown numbers bother you, turn on Silence unknown callers (if available).",
        trainerNote: "This blocks spam calls.",
      },
    ],
  },
  {
    id: "leave-group",
    title: "Leave a Group",
    description: "Exit a group you no longer want",
    steps: [
      {
        text: "Open the group you want to leave.",
        trainerNote: "Find it in your Chats list.",
      },
      {
        text: "Tap the group's name at the top.",
        trainerNote: "This opens group information.",
      },
      {
        text: "Scroll to the bottom. Tap Exit group.",
        trainerNote: "You may need to scroll quite a bit.",
      },
      {
        text: "Tap Exit again to confirm.",
        trainerNote: "This is the final step.",
      },
      {
        text: "You will no longer get messages from that group.",
        trainerNote: "You can be added back if someone invites you.",
      },
    ],
  },
];
