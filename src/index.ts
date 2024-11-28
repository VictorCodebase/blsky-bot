import { postImage } from './clients/at';
import { getNextImage } from './images';
import * as dotenv from 'dotenv';
import { CronJob } from 'cron';
import express from 'express'; // Import express

dotenv.config();

// Initialize Express
const app = express();
const port = process.env.PORT || 3000; // Use port from environment variables or default to 3000

// Middleware to handle JSON requests (if needed)
app.use(express.json());

// HTTP GET endpoint for checking the server status (ping endpoint)
app.get('/', (req, res) => {
  res.send('Bot is running!'); // Simple message to confirm the bot is live
});

// The original image caption logic
function postTextFromImageName(imageName: string): string {
  const nameWithoutExtension = imageName.replace('.png', '');
  let dateParts;
  if (nameWithoutExtension.includes('-')) {
    dateParts = nameWithoutExtension.split('-');
  } else {
    dateParts = [
      new Date().getFullYear().toString(),
      (new Date().getMonth() + 1).toString(),
      new Date().getDate().toString(),
    ];
  }

  const date = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2] || 1));
  const formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return formatter.format(date);
}

function imageCaption() {
  const sweetTexts = [
    'Here’s your daily dose of laughs! 😄 Drop your favorite memes below! 👇',
    'This one’s for you. 😂 Got a better meme? Share it! 💬',
    'Let’s kickstart the day with a smile! 😊 Tag someone who needs this! 🏷️',
    'Memes so fresh, they’re still sizzling. 🔥 What’s the hottest meme you’ve seen? 🔥',
    'Who needs coffee when you have this? ☕😂 Share your funniest finds below! 😂',
    'Bet you can’t unsee this! 🤭 Got something even crazier? Let’s see it! 👀',
    'Warning: May cause uncontrollable laughter. 🤣 Who else finds this hilarious? 😂',
    'So meme-tastic, it hurts. 😂 Drop your funniest meme below! 👇',
    'For all you meme lovers out there! 😍 Tag a fellow meme addict! 😂',
    'Because everyone deserves a smile today. 😊 Share this with someone who needs it! ❤️',
    'Fresh meme delivery straight to your feed! 🚚 Got a favorite? Let us know below! 👇',
    'Just when you thought you’d seen it all… 😉 What’s your all-time favorite meme? 🤔',
    'Spreading joy, one meme at a time! 🌟 Who should we tag in the next one? 📩',
    'Brace yourself for this one. 🤯 What’s the funniest meme you’ve seen lately? 😂',
    'Your daily serotonin boost! 🧠✨ Who else can relate to this? 😂',
    'Sometimes, it’s the little things. 🥰 What’s your go-to meme for a bad day? 🥹',
    'Meme o’clock has struck again! 🕒 Got a clock-worthy meme? Post it below! 🕰️',
    'Can’t stop laughing at this one. 😂 Tag someone who would burst out laughing! 😂',
    'For those who needed this today. ❤️ Spread the love and share your memes too! 💖',
    'Because Mondays need memes. 🥱➡️😆 How are you fighting the Monday blues? 🧘‍♀️',
    'Caught this gem just for you. 💎 Got a rare meme to share? Let’s see it! 💎',
    'If this doesn’t make you laugh, nothing will. 🤔 Prove us wrong with your memes! 😉',
    'Too good not to share! 🤩 What’s your latest meme obsession? Let’s laugh together! 😂',
    'Saving you from the Monday blues… or any blues. 💙 What’s your funniest Monday moment? 😂',
    'Sending meme vibes your way. 📡 Got meme vibes for us? Drop them below! 🎤',
    'Can you relate to this one? 😂 What’s the most relatable meme you’ve ever seen? 🫂',
    'Tag someone who needs this today! 👇 Who deserves this laugh the most? 😂',
    'Who else feels called out? 😳😂 What’s your most accurate ‘called out’ meme? 🫢',
    'Relatable content alert! 🚨 Drop a meme we can all relate to! 📢',
    'Because life’s too short for bad memes. 😎 What’s your all-time favorite good meme? 🌟',
    'This one’s been living rent-free in my head. 🏠 What meme has been stuck in your head? 🌀',
    'Proof that humor is the best medicine. 🩺😂 What’s your funniest cure-all meme? 💊',
    'Let’s take a laugh break together! ⏸️😂 Got a meme to brighten the pause? 🛋️',
    'Just a little something to make you smile. 😊 Got a better smile-worthy meme? Let’s see it! 😁',
    'Tell me this isn’t the funniest thing you’ve seen. 😂 What’s the last meme that broke you? 🤣',
    'Because we all need a good laugh sometimes. 😄 What’s your ultimate pick-me-up meme? 😊',
    "You've been visited by the meme fairy! 🧚‍♀️✨ Share the luck with your favorite meme! 🪄",
    'Who else can’t stop laughing at this? 😂 What’s a meme that always gets you? 😂',
    'Laughter is free; here’s some extra for today. 💸😂 Who else deserves free laughs? Tag them! ❤️',
    'Memes that slap harder than reality. ✋😂 What’s the meme that slapped you hardest? 😂',
    'Let’s make the funniest meme exclusive thread 😂 Got a contender? Share it here! 👇',
  ];

  return sweetTexts[Math.floor(Math.random() * sweetTexts.length)];
}

function altTextFromImageName(imageName: string): string {
  return 'Image from ' + postTextFromImageName(imageName);
}

async function main() {
  scheduleJobs();
  // Start the HTTP server
  app.listen(port, () => {
    console.log(`Bot is listening at http://localhost:${port}`);
  });
}

const scheduleJobs = () => {
  const jobTimes = ['0 8 * * *', '0 14 * * *', '0 20 * * *'];

  jobTimes.forEach((cronTime, index) => {
    const job = new CronJob(
      cronTime,
      async () => {
        console.log(`Running scheduled job ${index + 1}`);

        // Image posting logic
        const { LAST_IMAGE_NAME: lastImageName } = process.env;
        const nextImage = await getNextImage({ lastImageName });

        console.log(nextImage.imageName);

        await postImage({
          path: nextImage.absolutePath,
          text: imageCaption(),
          altText: altTextFromImageName(nextImage.imageName),
        });
      },
      null,
      true,
      'America/New_York',
    );
    job.start();
    if (index === 0) {
      (async () => {
        console.log('Posting image immediately');
        const { LAST_IMAGE_NAME: lastImageName } = process.env;
        const nextImage = await getNextImage({ lastImageName });

        await postImage({
          path: nextImage.absolutePath,
          text: imageCaption(),
          altText: altTextFromImageName(nextImage.imageName),
        });
      })();
    }
  });
};

main();
