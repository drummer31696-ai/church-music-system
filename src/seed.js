import { db } from './firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

const initialSongs = [
  { title: 'Goodness of God', artist: 'Bethel Music', category: 'Worship', key: 'Ab', bpm: 63 },
  { title: 'Who You Say I Am', artist: 'Hillsong Worship', category: 'Worship', key: 'G', bpm: 58 },
  { title: 'Victory in Jesus', artist: 'Traditional', category: 'Victory', key: 'G', bpm: 110 },
  { title: 'Lion and the Lamb', artist: 'Bethel Music', category: 'Praise', key: 'B', bpm: 90 },
  { title: 'Indescribable', artist: 'Chris Tomlin', category: 'Praise', key: 'Bb', bpm: 82 },
  { title: 'I Surrender', artist: 'Hillsong Worship', category: 'Consecration', key: 'Dm', bpm: 76 },
  { title: 'Broken Vessels', artist: 'Hillsong Worship', category: 'Consecration', key: 'G', bpm: 72 },
  { title: 'Give Thanks', artist: 'Don Moen', category: 'Offering', key: 'F', bpm: 74 },
  { title: 'God is Good All The Time', artist: 'Don Moen', category: 'Closing', key: 'D', bpm: 120 },
  { title: 'Graves into Gardens', artist: 'Elevation Worship', category: 'Praise', key: 'B', bpm: 70 },
  { title: 'Gratitude', artist: 'Brandon Lake', category: 'Worship', key: 'B', bpm: 78 },
  { title: 'Way Maker', artist: 'Sinach', category: 'Worship', key: 'G', bpm: 68 },
  { title: 'Mighty to Save', artist: 'Hillsong', category: 'Praise', key: 'G', bpm: 75 },
  { title: '10,000 Reasons', artist: 'Matt Redman', category: 'Worship', key: 'G', bpm: 73 },
  { title: 'What A Beautiful Name', artist: 'Hillsong', category: 'Worship', key: 'D', bpm: 68 }
];

async function seedDatabase() {
    console.log("Starting to seed database...");
    const batch = writeBatch(db);
    const songsRef = collection(db, "songs");

    initialSongs.forEach((song) => {
        const newDocRef = doc(songsRef);
        batch.set(newDocRef, {
            ...song,
            addedAt: serverTimestamp()
        });
    });

    try {
        await batch.commit();
        console.log("Successfully seeded database with songs!");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}

seedDatabase();
