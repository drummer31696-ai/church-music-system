import { useState, useMemo, useEffect } from 'react';
import { 
  Music, 
  Search, 
  Plus, 
  Calendar, 
  PlayCircle, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  X,
  Share2,
  Copy,
  ExternalLink,
  PlusCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

function App() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [showCopied, setShowCopied] = useState(false);
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [globalResults, setGlobalResults] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [isImporting, setIsImporting] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [lineupText, setLineupText] = useState('');
  const [showMobileLineup, setShowMobileLineup] = useState(false);
  const [albumCache, setAlbumCache] = useState({});
  const [isGeneratingPlaylist, setIsGeneratingPlaylist] = useState(false);
  const [youtubePlaylistUrl, setYoutubePlaylistUrl] = useState('');
  const [youtubeThumbnails, setYoutubeThumbnails] = useState({});
  const [newSong, setNewSong] = useState({ title: '', artist: '', category: 'Praise', key: '', bpm: '' });
  
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  
  useEffect(() => {
    console.log("Current songs count:", songs.length);
    console.log("Is Adding Song:", isAddingSong);
    console.log("New Song state:", newSong);
  }, [songs, isAddingSong, newSong]);

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
    { title: 'What A Beautiful Name', artist: 'Hillsong', category: 'Worship', key: 'D', bpm: 68 },
    { title: 'Build My Life', artist: 'Housefires', category: 'Worship', key: 'G', bpm: 68 },
    { title: 'Living Hope', artist: 'Phil Wickham', category: 'Praise', key: 'Eb', bpm: 72 },
    { title: 'The Blessing', artist: 'Elevation / Kari Jobe', category: 'Closing', key: 'B', bpm: 70 },
    { title: 'Holy Spirit', artist: 'Francesca Battistelli', category: 'Consecration', key: 'D', bpm: 72 },
    { title: 'Cornerstone', artist: 'Hillsong Worship', category: 'Worship', key: 'C', bpm: 71 },
    { title: 'Hosanna', artist: 'Hillsong United', category: 'Praise', key: 'E', bpm: 76 },
    { title: 'Reckless Love', artist: 'Cory Asbury', category: 'Worship', key: 'Gb', bpm: 83 },
    { title: 'O Come to the Altar', artist: 'Elevation Worship', category: 'Consecration', key: 'B', bpm: 70 },
    { title: 'Oceans (Where Feet May Fail)', artist: 'Hillsong United', category: 'Worship', key: 'Bm', bpm: 64 },
    { title: 'King of My Heart', artist: 'Bethel Music', category: 'Worship', key: 'Bb', bpm: 68 },
    { title: 'Blessed Be Your Name', artist: 'Matt Redman', category: 'Praise', key: 'A', bpm: 116 },
    { title: 'How Great Is Our God', artist: 'Chris Tomlin', category: 'Victory', key: 'A', bpm: 78 },
    { title: 'Great Are You Lord', artist: 'All Sons & Daughters', category: 'Worship', key: 'A', bpm: 72 },
    { title: 'Way Maker', artist: 'Leeland', category: 'Worship', key: 'E', bpm: 68 },
    { title: 'Tremble', artist: 'Mosaic MSC', category: 'Worship', key: 'B', bpm: 74 },
    { title: 'House of the Lord', artist: 'Phil Wickham', category: 'Praise', key: 'Bb', bpm: 116 },
    { title: 'Jireh', artist: 'Elevation Worship / Maverick City', category: 'Worship', key: 'Eb', bpm: 70 },
    { title: 'Promises', artist: 'Maverick City Music', category: 'Worship', key: 'Bb', bpm: 68 },
    { title: 'Battle Belongs', artist: 'Phil Wickham', category: 'Victory', key: 'Db', bpm: 81 },
    { title: 'In Christ Alone', artist: 'Kristian Stanfill', category: 'Victory', key: 'G', bpm: 68 },
    { title: 'Same God', artist: 'Elevation Worship', category: 'Worship', key: 'Db', bpm: 72 },
    { title: 'King of Kings', artist: 'Hillsong Worship', category: 'Victory', key: 'D', bpm: 68 },
    { title: 'Resurrecting', artist: 'Elevation Worship', category: 'Victory', key: 'Db', bpm: 74 },
    { title: 'Glorious Day', artist: 'Passion', category: 'Praise', key: 'D', bpm: 110 },
    { title: 'Yes I Will', artist: 'Vertical Worship', category: 'Praise', key: 'C', bpm: 76 },
    { title: 'Raise a Hallelujah', artist: 'Bethel Music', category: 'Victory', key: 'Db', bpm: 82 },
    { title: 'Do It Again', artist: 'Elevation Worship', category: 'Worship', key: 'Bb', bpm: 86 },
    { title: 'I Believe', artist: 'Phil Wickham', category: 'Praise', key: 'Bb', bpm: 80 },
    { title: 'Worthy of It All', artist: 'CeCe Winans', category: 'Worship', key: 'E', bpm: 66 },
    { title: 'Firm Foundation', artist: 'Cody Carnes', category: 'Worship', key: 'Bb', bpm: 75 },
    { title: 'Honey in the Rock', artist: 'Brooke Ligertwood', category: 'Praise', key: 'Db', bpm: 62 },
    { title: 'God Turn It Around', artist: 'Jon Reddick', category: 'Worship', key: 'G', bpm: 74 },
    { title: 'Behold the Lamb', artist: 'Kristian Stanfill', category: 'Worship', key: 'D', bpm: 70 },
    { title: 'Agnus Dei', artist: 'Michael W. Smith', category: 'Worship', key: 'A', bpm: 68 },
    { title: 'Heart of Worship', artist: 'Matt Redman', category: 'Consecration', key: 'D', bpm: 72 },
    { title: 'Still', artist: 'Hillsong Worship', category: 'Worship', key: 'C', bpm: 68 },
    { title: 'Shout to the Lord', artist: 'Darlene Zschech', category: 'Praise', key: 'A', bpm: 78 },
    { title: 'Trading My Sorrows', artist: 'Israel Houghton', category: 'Praise', key: 'A', bpm: 120 },
    { title: 'Open the Eyes of My Heart', artist: 'Paul Baloche', category: 'Praise', key: 'E', bpm: 110 },
    { title: 'Days of Elijah', artist: 'Robin Mark', category: 'Praise', key: 'G', bpm: 105 },
    { title: 'Your Grace Is Enough', artist: 'Chris Tomlin', category: 'Victory', key: 'G', bpm: 120 },
    { title: 'Our God', artist: 'Chris Tomlin', category: 'Praise', key: 'G', bpm: 105 },
    { title: 'Forever', artist: 'Chris Tomlin', category: 'Praise', key: 'A', bpm: 120 },
    { title: 'Holy Is The Lord', artist: 'Chris Tomlin', category: 'Worship', key: 'G', bpm: 76 },
    { title: 'Mighty Cross', artist: 'Elevation Worship', category: 'Victory', key: 'A', bpm: 74 },
    { title: 'I Will Follow', artist: 'Chris Tomlin', category: 'Consecration', key: 'Bb', bpm: 100 },
    { title: 'Good Good Father', artist: 'Chris Tomlin', category: 'Worship', key: 'A', bpm: 72 },
    { title: 'Holy Forever', artist: 'Chris Tomlin', category: 'Worship', key: 'Db', bpm: 72 },
    { title: 'Trust In God', artist: 'Elevation Worship', category: 'Worship', key: 'C', bpm: 76 },
    { title: 'Names', artist: 'Elevation / Tiffany Hudson', category: 'Worship', key: 'A', bpm: 68 },
    { title: 'Fear is a Liar', artist: 'Zach Williams', category: 'Victory', key: 'G', bpm: 72 },
    { title: 'Old Church Choir', artist: 'Zach Williams', category: 'Praise', key: 'Bb', bpm: 124 },
    { title: 'Chain Breaker', artist: 'Zach Williams', category: 'Victory', key: 'C', bpm: 78 },
    { title: 'You Say', artist: 'Lauren Daigle', category: 'Worship', key: 'F', bpm: 74 },
    { title: 'Rescue', artist: 'Lauren Daigle', category: 'Worship', key: 'E', bpm: 68 },
    { title: 'First', artist: 'Lauren Daigle', category: 'Consecration', key: 'D', bpm: 82 },
    { title: 'How Can It Be', artist: 'Lauren Daigle', category: 'Worship', key: 'A', bpm: 74 },
    { title: 'Is He Worthy?', artist: 'Shane & Shane', category: 'Worship', key: 'B', bpm: 68 },
    { title: 'Psalm 23', artist: 'Shane & Shane', category: 'Worship', key: 'E', bpm: 72 },
    { title: 'You Are My King (Amazing Love)', artist: 'Newsboys', category: 'Victory', key: 'D', bpm: 74 },
    { title: 'He Reigns', artist: 'Newsboys', category: 'Praise', key: 'C', bpm: 110 },
    { title: 'Lord, I Need You', artist: 'Matt Maher', category: 'Consecration', key: 'G', bpm: 74 },
    { title: 'Your Love Never Fails', artist: 'Jesus Culture', category: 'Victory', key: 'Bb', bpm: 114 },
    { title: 'Fierce', artist: 'Jesus Culture', category: 'Praise', key: 'A', bpm: 80 },
    { title: 'Miracles', artist: 'Jesus Culture', category: 'Worship', key: 'A', bpm: 72 },
    { title: 'No Longer Slaves', artist: 'Bethel Music', category: 'Victory', key: 'Bb', bpm: 74 },
    { title: 'It Is Well', artist: 'Bethel Music / Kristene DiMarco', category: 'Worship', key: 'G', bpm: 68 },
    { title: 'Abundantly More', artist: 'North Point Worship', category: 'Praise', key: 'C', bpm: 120 },
    { title: 'Glorious Day', artist: 'Passion / Kristian Stanfill', category: 'Praise', key: 'D', bpm: 110 },
    { title: 'Build Your Kingdom Here', artist: 'Rend Collective', category: 'Praise', key: 'D', bpm: 130 },
    { title: 'My Lighthouse', artist: 'Rend Collective', category: 'Praise', key: 'C', bpm: 110 },
    { title: 'A Thousand Hallelujahs', artist: 'Brooke Ligertwood', category: 'Worship', key: 'D', bpm: 68 },
    { title: 'Honey in the Rock', artist: 'Brooke Ligertwood', category: 'Praise', key: 'Db', bpm: 62 },
    { title: 'Egypt', artist: 'Cory Asbury', category: 'Victory', key: 'Ab', bpm: 78 },
    { title: 'I Thank God', artist: 'Maverick City Music', category: 'Praise', key: 'Db', bpm: 130 },
    { title: 'God Really Loves Us', artist: 'Crowder / Dante Bowe', category: 'Worship', key: 'C', bpm: 72 },
    { title: 'Goodness of God', artist: 'CeCe Winans', category: 'Worship', key: 'A', bpm: 64 },
    { title: 'Believe For It', artist: 'CeCe Winans', category: 'Victory', key: 'A', bpm: 74 },
    { title: 'More Than Able', artist: 'Elevation Worship', category: 'Worship', key: 'G', bpm: 68 },
    { title: 'Praise', artist: 'Elevation Worship', category: 'Praise', key: 'B', bpm: 127 },
    { title: 'Worthy', artist: 'Elevation Worship', category: 'Worship', key: 'D', bpm: 68 },
    { title: 'Canvas and Clay', artist: 'Pat Barrett', category: 'Worship', key: 'G', bpm: 72 },
    { title: 'Build My Life', artist: 'Pat Barrett', category: 'Worship', key: 'G', bpm: 68 },
    { title: 'The Lion and the Lamb', artist: 'Big Daddy Weave', category: 'Victory', key: 'A', bpm: 92 },
    { title: 'My Story', artist: 'Big Daddy Weave', category: 'Victory', key: 'C', bpm: 74 },
    { title: 'Alive', artist: 'Hillsong Young & Free', category: 'Praise', key: 'E', bpm: 130 },
    { title: 'Wake', artist: 'Hillsong Young & Free', category: 'Praise', key: 'A', bpm: 128 },
    { title: 'Real Love', artist: 'Hillsong Young & Free', category: 'Praise', key: 'E', bpm: 124 },
    // Tagalog Songs
    { title: 'Safe', artist: 'Victory Worship', category: 'Worship', key: 'C', bpm: 72 },
    { title: 'Awit ng Pag-asa', artist: 'Victory Worship', category: 'Praise', key: 'D', bpm: 115 },
    { title: 'Hesus', artist: 'Victory Worship', category: 'Worship', key: 'A', bpm: 68 },
    { title: 'Lilim', artist: 'Victory Worship', category: 'Worship', key: 'G', bpm: 64 },
    { title: 'Tapat Ka O Diyos', artist: 'Malayang Pilipino', category: 'Worship', key: 'A', bpm: 70 },
    { title: 'Higit sa Lahat', artist: 'Malayang Pilipino', category: 'Praise', key: 'G', bpm: 120 },
    { title: 'Dakilang Katapatan', artist: 'Papuri!', category: 'Worship', key: 'C', bpm: 64 },
    { title: 'Tanging Pagmamahal', artist: 'Victory Worship', category: 'Consecration', key: 'E', bpm: 72 },
    // Bisaya Songs
    { title: 'Way Sama', artist: 'Bisaya Worship', category: 'Worship', key: 'G', bpm: 68 },
    { title: 'Siyay Matinud-anon', artist: 'Bisaya Worship', category: 'Worship', key: 'F', bpm: 70 },
    { title: 'Ihalad Ko', artist: 'Bisaya Worship', category: 'Consecration', key: 'D', bpm: 72 },
    { title: 'Dios Mo-atiman', artist: 'Bisaya Worship', category: 'Worship', key: 'C', bpm: 66 },
    { title: 'Salamat O Dios', artist: 'Bisaya Worship', category: 'Offering', key: 'G', bpm: 74 },
    { title: 'Kupti Ako', artist: 'Bisaya Worship', category: 'Worship', key: 'E', bpm: 64 },
    { title: 'Bag-ong Adlaw', artist: 'Bisaya Worship', category: 'Praise', key: 'A', bpm: 120 },
    { title: 'Pagabayawon Ka', artist: 'Kansang Gabayan', category: 'Praise', key: 'G', bpm: 110 }
  ];

  const [lineupRole, setLineupRole] = useState('');
  const [lineupTheme, setLineupTheme] = useState('');

  // Define fixed slots for the lineup in the specific order requested
  const [lineupSlots, setLineupSlots] = useState([
    { id: 'victory', label: 'Victory Song', category: 'Victory', songs: [] },
    { id: 'consecration', label: 'Consecration', category: 'Consecration', songs: [] },
    { id: 'praise', label: 'Praise', category: 'Praise', songs: [] },
    { id: 'worship', label: 'Worship', category: 'Worship', songs: [] },
    { id: 'offering', label: 'Offering Song', category: 'Offering', songs: [] },
    { id: 'communion', label: 'Communion Song', category: 'Communion', songs: [] },
    { id: 'closing', label: 'Closing Song', category: 'Closing', songs: [] }
  ]);

  useEffect(() => {
    let slotsConfig = [];
    if (lineupRole === 'Moderator') {
      slotsConfig = [
        { id: 'victory', label: 'Victory Song', category: 'Victory' },
        { id: 'consecration', label: 'Consecration', category: 'Consecration' },
        { id: 'offering', label: 'Offering Song', category: 'Offering' },
        { id: 'communion', label: 'Communion Song', category: 'Communion' },
        { id: 'closing', label: 'Closing Song', category: 'Closing' }
      ];
    } else if (lineupRole === 'Worship Leader') {
      slotsConfig = [
        { id: 'praise', label: 'Praise', category: 'Praise' },
        { id: 'worship', label: 'Worship', category: 'Worship' }
      ];
    } else if (lineupRole === 'All') {
      slotsConfig = [
        { id: 'victory', label: 'Victory Song', category: 'Victory' },
        { id: 'consecration', label: 'Consecration', category: 'Consecration' },
        { id: 'praise', label: 'Praise', category: 'Praise' },
        { id: 'worship', label: 'Worship', category: 'Worship' },
        { id: 'offering', label: 'Offering Song', category: 'Offering' },
        { id: 'communion', label: 'Communion Song', category: 'Communion' },
        { id: 'closing', label: 'Closing Song', category: 'Closing' }
      ];
    } else {
      slotsConfig = []; // Do not show slots if empty
    }
    
    setLineupSlots(prev => slotsConfig.map(slot => {
        const existing = prev.find(p => p.id === slot.id);
        return { ...slot, songs: existing ? existing.songs : [] };
    }));
  }, [lineupRole]);

  useEffect(() => {
    // Background generator for YouTube Playlist
    const updatePlaylistInBackground = async () => {
      if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here' || !YOUTUBE_API_KEY.startsWith('AIza')) return;
      
      const allSongs = lineupSlots.flatMap(slot => slot.songs);
      if (allSongs.length === 0) {
        setYoutubePlaylistUrl('');
        return;
      }

      try {
        const searchPromises = allSongs.map(song => searchYouTubeVideo(song));
        const results = await Promise.all(searchPromises);
        const validResults = results.filter(r => r !== null);
        const videoIds = validResults.map(r => r.videoId);
        
        // Update thumbnails in background too
        const newThumbs = {};
        validResults.forEach(r => { newThumbs[r.id] = r.thumbnail; });
        setYoutubeThumbnails(prev => ({ ...prev, ...newThumbs }));

        if (videoIds.length > 0) {
          const url = `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(',')}`;
          setYoutubePlaylistUrl(url);
        }
      } catch (err) {
        console.log('Background playlist gen failed:', err);
      }
    };

    const timeoutId = setTimeout(updatePlaylistInBackground, 1000); // Debounce to avoid too many API calls
    return () => clearTimeout(timeoutId);
  }, [lineupSlots]);

  // Fetch songs from Firestore in real-time

  // Fetch songs from Firestore in real-time
  useEffect(() => {
    // Add a safety timeout to stop loading if DB is unresponsive
    const timeout = setTimeout(() => {
        if (loading) setLoading(false);
    }, 5000);

    try {
        const q = query(collection(db, "songs"), orderBy("addedAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const songsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSongs(songsData);
            setLoading(false);
            clearTimeout(timeout);
        }, (error) => {
            console.error("Firestore error:", error);
            setLoading(false);
            clearTimeout(timeout);
        });
        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    } catch (err) {
        setLoading(false);
        clearTimeout(timeout);
    }
  }, []);

  const categories = ['All', 'Victory', 'Praise', 'Worship', 'Consecration', 'Offering', 'Communion', 'Closing'];

  const getSongThemes = (title) => {
    if (!title) return '';
    const t = title.toLowerCase();
    let keywords = t; // Always include the title itself
    
    // Thematic keyword mappings based on common words in titles
    if (t.includes('cross') || t.includes('blood') || t.includes('lamb') || t.includes('resurrect') || t.includes('grave') || t.includes('alive') || t.includes('agnus')) keywords += ' sacrifice easter forgiveness salvation redemption grace blood atonement';
    if (t.includes('love') || t.includes('reckless') || t.includes('father') || t.includes('good') || t.includes('grace')) keywords += ' mercy unconditional compassion kindness acceptance family';
    if (t.includes('holy') || t.includes('spirit') || t.includes('ghost')) keywords += ' presence pentecost power fire awe reverence spirit anointing';
    if (t.includes('hope') || t.includes('trust') || t.includes('anchor') || t.includes('promise')) keywords += ' faith future confidence assurance steadfast';
    if (t.includes('joy') || t.includes('happy') || t.includes('praise') || t.includes('shout') || t.includes('hallelujah') || t.includes('hosanna')) keywords += ' thanksgiving celebration gladness worship dance exalt';
    if (t.includes('victory') || t.includes('overcome') || t.includes('battle') || t.includes('champion') || t.includes('king') || t.includes('reign') || t.includes('conquer')) keywords += ' power triumph win victorious majestic warfare fight';
    if (t.includes('peace') || t.includes('still') || t.includes('rest') || t.includes('quiet') || t.includes('safe') || t.includes('lilim')) keywords += ' comfort calm safety refuge stillness shelter';
    if (t.includes('grace') || t.includes('mercy') || t.includes('forgive')) keywords += ' love favor unmerited cross pardon';
    if (t.includes('fire') || t.includes('revival') || t.includes('burn') || t.includes('awake')) keywords += ' passion spirit awaken renewal zeal';
    if (t.includes('surrender') || t.includes('yield') || t.includes('give') || t.includes('heart') || t.includes('offer') || t.includes('ihalad')) keywords += ' commitment dedication devotion sacrifice life all';
    if (t.includes('heal') || t.includes('broken') || t.includes('vessel')) keywords += ' restoration comfort wholeness mend sick cure';
    if (t.includes('way maker') || t.includes('miracle') || t.includes('impossible')) keywords += ' power trust signs wonders impossible divine';
    if (t.includes('goodness') || t.includes('faithful') || t.includes('tapat') || t.includes('matinud-anon')) keywords += ' trust provider provision reliable steadfast loyal goodness';
    if (t.includes('light') || t.includes('shine') || t.includes('sun') || t.includes('adlaw')) keywords += ' glory darkness bright morning day star illumination';
    if (t.includes('thank') || t.includes('salamat') || t.includes('gratitude')) keywords += ' thanksgiving grateful bless appreciate offering';
    if (t.includes('name') || t.includes('jesus') || t.includes('christ') || t.includes('hesus')) keywords += ' power authority exalted savior lord messiah';
    if (t.includes('bless')) keywords += ' favor provision grace goodness peace';
    if (t.includes('worthy') || t.includes('majesty') || t.includes('glorious')) keywords += ' honor praise exalt awe reverence holy throne';
    if (t.includes('fear') || t.includes('chain') || t.includes('rescue')) keywords += ' freedom deliverance break bounds safe save free captivity';
    
    // Explicit themes for specific popular songs
    if (t === '10,000 reasons') keywords += ' thanksgiving soul bless praise gratitude morning';
    if (t === 'what a beautiful name') keywords += ' jesus power resurrection majestic name word creation';
    if (t === 'build my life') keywords += ' foundation trust holy devotion foundation rock';
    if (t === 'oceans (where feet may fail)') keywords += ' faith trust water spirit guide deep calling walk';
    if (t === 'firm foundation') keywords += ' rock trust steady safe faith storm';
    if (t === 'jireh') keywords += ' provider enough content peace trust provision';
    if (t === 'in christ alone') keywords += ' foundation resurrection cross cornerstone strength';
    if (t === 'cornerstone') keywords += ' rock storm anchor foundation christ';
    
    return keywords;
  };

  const filteredSongs = useMemo(() => {
    let categoryToFilter = activeCategory;
    if (activeSlotId && activeCategory === 'All') {
        const activeSlot = lineupSlots.find(s => s.id === activeSlotId);
        if (activeSlot) categoryToFilter = activeSlot.category;
    }

    return songs.filter(song => {
      if (!song) return false;
      const matchesCategory = categoryToFilter === 'All' || song.category === categoryToFilter;
      const matchesSearch = (song.title?.toLowerCase() || '').includes(searchQuery?.toLowerCase() || '') || 
                           (song.artist?.toLowerCase() || '').includes(searchQuery?.toLowerCase() || '');
      const songKeywords = getSongThemes(song.title);
      
      const matchesTheme = lineupTheme ? songKeywords.includes(lineupTheme?.toLowerCase()?.trim()) : true;

      return matchesCategory && matchesSearch && matchesTheme;
    });
  }, [activeCategory, searchQuery, lineupTheme, activeSlotId, lineupSlots, songs]);

  const fetchAlbumArt = async (song) => {
    if (!song?.title || albumCache[song.id]) return;
    try {
      const query = encodeURIComponent(`${song.title} ${song.artist || ''} christian`);
      const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const r = data.results[0];
        setAlbumCache(prev => ({
          ...prev,
          [song.id]: {
            artUrl: r.artworkUrl100?.replace('100x100', '300x300') || r.artworkUrl100,
            albumName: r.collectionName || '',
          }
        }));
      }
    } catch (err) {
      console.log('Album art fetch failed:', err);
    }
  };

  const addToSlot = (song) => {
    if (activeSlotId) {
      setLineupSlots(lineupSlots.map(slot => {
        if (slot.id === activeSlotId) {
          if (slot.songs.find(s => s.id === song.id)) return slot;
          fetchAlbumArt(song);
          return { ...slot, songs: [...slot.songs, song] };
        }
        return slot;
      }));
    }
  };

  const removeSongFromSlot = (slotId, songId) => {
    setLineupSlots(lineupSlots.map(slot => 
      slot.id === slotId ? { ...slot, songs: slot.songs.filter(s => s.id !== songId) } : slot
    ));
  };

  const handleSlotClick = (slot) => {
    setActiveSlotId(slot.id);
    setActiveCategory(slot.category);
  };

  const searchYouTubeVideo = async (song) => {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here') return null;
    try {
      const q = encodeURIComponent(`${song.title} ${song.artist || ''} worship`);
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return {
          id: song.id,
          videoId: data.items[0].id.videoId,
          thumbnail: data.items[0].snippet.thumbnails.high?.url || data.items[0].snippet.thumbnails.default?.url
        };
      }
    } catch (err) {
      console.log('YouTube search error:', err);
    }
    return null;
  };

  const generateYouTubePlaylist = async () => {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here' || !YOUTUBE_API_KEY.startsWith('AIza')) {
      alert('⚠️ Kulang o mali ang YouTube API Key. Palihug i-check ang imong .env file.');
      return;
    }
    setIsGeneratingPlaylist(true);
    setYoutubePlaylistUrl('');
    const newThumbs = {};
    try {
      const allSongs = lineupSlots.flatMap(slot => slot.songs);
      const videoIds = [];
      for (const song of allSongs) {
        const result = await searchYouTubeVideo(song);
        if (result) {
          videoIds.push(result.videoId);
          newThumbs[song.id] = result.thumbnail;
        }
      }
      setYoutubeThumbnails(newThumbs);
      if (videoIds.length > 0) {
        const url = `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(',')}`;
        setYoutubePlaylistUrl(url);
        // Update the lineup text to include the playlist link
        setLineupText(prev => {
          const marker = '----------------------------\nSent from Church Music System';
          const playlistLine = `\n🎵 *Playlist (YouTube):*\n${url}\n\n`;
          return prev.includes(marker) ? prev.replace(marker, playlistLine + marker) : prev + playlistLine;
        });
      } else {
        alert('❌ Wala makit-i ang mga video sa YouTube. Siguroha nga husto imong API key.');
      }
    } catch (err) {
      console.error('Playlist generation error:', err);
    }
    setIsGeneratingPlaylist(false);
  };

  const shareLineup = () => {
    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    lineupSlots.forEach(slot => slot.songs.forEach(song => fetchAlbumArt(song)));
    
    let roleText = lineupRole === 'All' ? 'Full Service' : lineupRole;
    let text = `🕊️ *Worship Lineup (${roleText}) - ${today}*\n`;
    text += `----------------------------\n\n`;

    lineupSlots.forEach(slot => {
        if (slot.songs.length > 0) {
            text += `📍 *${slot.label.toUpperCase()}*\n`;
            slot.songs.forEach((song, idx) => {
                const albumInfo = albumCache[song.id];
                const albumText = albumInfo?.albumName ? ` | 💿 ${albumInfo.albumName}` : '';
                text += `  ${idx + 1}. ${song.title} (${song.key})${albumText}\n`;
            });
            text += `\n`;
        }
    });

    if (youtubePlaylistUrl) {
      text += `🎵 *Playlist (YouTube):*\n${youtubePlaylistUrl}\n\n`;
    }

    text += `----------------------------\n`;
    text += `Sent from Church Music System 🎹`;

    setLineupText(text);
    setShowPreview(true);

    // This is now SYNCHRONOUS, so browsers won't block it!
    if (navigator.share) {
        navigator.share({
            title: 'Sunday Worship Lineup',
            text: text,
        }).catch(err => console.log('Share menu closed'));
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(err => console.log('Copy failed'));
    }
  };

  const openMessenger = () => {
    window.open('https://www.facebook.com/messages/t/', '_blank');
  };

  const shareToWhatsApp = () => {
    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    let roleText = lineupRole === 'All' ? 'Full Service' : lineupRole;
    let text = `🕊️ *Worship Lineup (${roleText}) - ${today}*\n`;
    text += `----------------------------\n\n`;

    lineupSlots.forEach(slot => {
        if (slot.songs.length > 0) {
            text += `📍 *${slot.label.toUpperCase()}*\n`;
            slot.songs.forEach((song, idx) => {
                const albumInfo = albumCache[song.id];
                const albumText = albumInfo?.albumName ? ` | 💿 ${albumInfo.albumName}` : '';
                text += `  ${idx + 1}. ${song.title} (${song.key})${albumText}\n`;
            });
            text += `\n`;
        }
    });

    if (youtubePlaylistUrl) {
        text += `\n🎵 *Playlist (i-click para ma-play tanan):*\n${youtubePlaylistUrl}\n\n`;
    }
    
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!newSong.title || !newSong.artist) return;
    
    try {
      await addDoc(collection(db, "songs"), {
        ...newSong,
        addedAt: serverTimestamp()
      });
      setNewSong({ title: '', artist: '', category: 'Praise', key: '', bpm: '' });
      setIsAddingSong(false);
    } catch (err) {
      console.error("Error adding song: ", err);
      alert("Error adding song. Check console for details.");
    }
  };

  const clearLineup = () => {
    if (window.confirm("Klaro nimo nga i-clear ang tibuok lineup?")) {
        setLineupSlots(lineupSlots.map(s => ({ ...s, songs: [] })));
    }
  };

  const seedDatabase = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
        const { writeBatch, doc } = await import('firebase/firestore');
        const batch = writeBatch(db);
        const songsRef = collection(db, "songs");

        initialSongs.forEach((song) => {
            const newDocRef = doc(songsRef);
            batch.set(newDocRef, {
                ...song,
                addedAt: serverTimestamp()
            });
        });

        await batch.commit();
        setIsSeeding(false);
        alert("✅ Malampuson nga na-import ang mga kanta!");
    } catch (err) {
        console.error("Error seeding:", err);
        setIsSeeding(false);
        alert("❌ May problema sa pag-import. Palihug sulayi og usab.");
    }
  };

  const searchOnline = async () => {
    if (!searchQuery) return;
    setIsSearchingGlobal(true);
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery + ' christian worship')}&entity=song&limit=6`);
        const data = await response.json();
        const results = data.results.map(r => ({
            id: `global-${r.trackId}`,
            title: r.trackName,
            artist: r.artistName,
            category: 'Worship', // Default
            key: '?', // iTunes doesn't provide key
            bpm: '?'  // iTunes doesn't provide BPM
        }));
        setGlobalResults(results);
    } catch (err) {
        console.error("Global search error:", err);
    }
    setIsSearchingGlobal(false);
  };

  const importSong = async (song) => {
    setIsImporting(song.id);
    try {
        await addDoc(collection(db, "songs"), {
            title: song.title,
            artist: song.artist,
            category: activeCategory === 'All' ? 'Worship' : activeCategory,
            key: '?',
            bpm: '0',
            addedAt: serverTimestamp()
        });
        setGlobalResults(prev => prev.filter(s => s.id !== song.id));
        alert(`✅ Na-add na ang '${song.title}' sa imong library!`);
    } catch (err) {
        console.error("Import error:", err);
        alert("❌ Dili ma-add ang kanta. Please try again.");
    }
    setIsImporting(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
              <Music className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                Church <span className="text-blue-600 block sm:inline">Music System</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsAddingSong(!isAddingSong)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Add Song</span>
            </button>
            <button 
                onClick={() => setShowMobileLineup(!showMobileLineup)}
                className="lg:hidden p-2 bg-slate-100 text-slate-600 rounded-xl relative"
            >
                <Calendar className="w-5 h-5" />
                {lineupSlots.reduce((acc, slot) => acc + slot.songs.length, 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                        {lineupSlots.reduce((acc, slot) => acc + slot.songs.length, 0)}
                    </span>
                )}
            </button>
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-4">
                <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-bold text-sm">
                RL
                </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
            {isAddingSong && (
                <div className="bg-white p-6 rounded-3xl border-2 border-blue-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Add New Song to Library</h3>
                        <button onClick={() => setIsAddingSong(false)} className="text-slate-400 hover:text-red-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleAddSong} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input 
                            type="text" required placeholder="Song Title"
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                            value={newSong?.title || ''} onChange={e => setNewSong({...newSong, title: e.target.value})}
                        />
                        <input 
                            type="text" required placeholder="Artist"
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                            value={newSong?.artist || ''} onChange={e => setNewSong({...newSong, artist: e.target.value})}
                        />
                        <select 
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                            value={newSong?.category || 'Praise'} onChange={e => setNewSong({...newSong, category: e.target.value})}
                        >
                            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input 
                            type="text" placeholder="Key"
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                            value={newSong?.key || ''} onChange={e => setNewSong({...newSong, key: e.target.value})}
                        />
                        <input 
                            type="number" placeholder="BPM"
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                            value={newSong?.bpm || ''} onChange={e => setNewSong({...newSong, bpm: e.target.value})}
                        />
                        <button type="submit" className="md:col-span-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm">
                            Save to Cloud
                        </button>
                    </form>
                    
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-left text-xs text-slate-500">
                            <p className="font-bold text-slate-700 mb-1">Quick Start / Bulk Import</p>
                            <p>Gusto nimo i-load ang 120+ common songs (English, Tagalog, & Bisaya)?</p>
                        </div>
                        <button 
                            onClick={seedDatabase}
                            disabled={isSeeding}
                            className="w-full sm:w-auto bg-blue-50 text-blue-600 hover:bg-blue-100 px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border border-blue-200 shadow-sm"
                        >
                            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                            {isSeeding ? 'Importing Samples...' : 'Import 120+ Samples (Filipino & Bisaya)'}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-full">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                  {activeSlotId ? `For ${lineupSlots.find(s => s.id === activeSlotId)?.label || ''}` : 'Song Library'}
                </h2>
                {activeSlotId && (
                    <button 
                        onClick={() => {setActiveSlotId(null); setActiveCategory('All');}}
                        className="text-xs sm:text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 mt-1"
                    >
                        <X className="w-3 h-3" /> Clear selection
                    </button>
                )}
              </div>
              
              <div className="relative group w-full md:w-auto md:min-w-[300px] flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                    <input 
                    type="text" 
                    placeholder="Search songs or artists..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value === '') setGlobalResults([]);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && searchOnline()}
                    />
                </div>
                {searchQuery && (
                    <button 
                        onClick={searchOnline}
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2"
                    >
                        {isSearchingGlobal ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                        Online
                    </button>
                )}
              </div>
            </div>

            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap gap-2 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`category-pill flex-shrink-0 sm:flex-shrink-1 px-4 py-2 ${
                    activeCategory === cat ? 'category-pill-active' : 'category-pill-inactive'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {loading ? (
                  <div className="col-span-full py-20 flex flex-col items-center text-slate-400">
                      <Loader2 className="w-10 h-10 animate-spin mb-4" />
                      <p>Connecting to Heaven's Database...</p>
                  </div>
              ) : songs.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                      <Music className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Empty Library</h3>
                      <p className="text-slate-500 mb-6 max-w-sm mx-auto">Wala pa'y sulod ang imong library. Gusto nimo butangan nato og mga common worship songs?</p>
                      <button 
                        onClick={seedDatabase}
                        disabled={isSeeding}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 mx-auto"
                      >
                        {isSeeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                        {isSeeding ? 'Adding Songs...' : 'Add Sample Songs'}
                      </button>
                  </div>
                ) : filteredSongs.length > 0 ? filteredSongs.map(song => (
                <div key={song?.id || Math.random()} className={`bg-white p-5 rounded-2xl border transition-all group relative overflow-hidden ${
                    activeSlotId ? 'ring-2 ring-blue-500/10 border-blue-200' : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}>
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    song?.category === 'Praise' ? 'bg-amber-400' : 
                    song?.category === 'Worship' ? 'bg-blue-400' : 
                    song?.category === 'Victory' ? 'bg-green-400' :
                    song?.category === 'Offering' ? 'bg-orange-400' :
                    song?.category === 'Closing' ? 'bg-red-400' : 'bg-purple-400'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      song?.category === 'Praise' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                      song?.category === 'Worship' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                      'bg-purple-50 text-purple-600 border border-purple-100'
                    }`}>
                      {song?.category || 'General'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Key: {song?.key || '?'}</span>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{song?.title || 'Untitled'}</h3>
                  <p className="text-sm text-slate-500 mb-4 truncate">{song?.artist || 'Unknown Artist'}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Clock className="w-3 h-3" />
                      {song?.bpm || '0'} BPM
                    </div>
                    {activeSlotId ? (
                        <button 
                            onClick={() => addToSlot(song)}
                            disabled={lineupSlots.find(s => s.id === activeSlotId)?.songs?.find(s => s.id === song?.id)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 disabled:bg-green-600 shadow-sm active:scale-95"
                        >
                            {lineupSlots.find(s => s.id === activeSlotId)?.songs?.find(s => s.id === song?.id) ? (
                                <><CheckCircle2 className="w-3.5 h-3.5" /> Added</>
                            ) : (
                                <><Plus className="w-3.5 h-3.5" /> Add to {lineupSlots.find(s => s.id === activeSlotId)?.label || 'Slot'}</>
                            )}
                        </button>
                    ) : (
                        <div className="text-[10px] text-slate-400 font-bold uppercase italic">Select a slot first</div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-10 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                    <Music className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium mb-1">No local songs found.</p>
                    <p className="text-[10px] text-slate-400">Click the 'Online' button or press Enter to search the internet.</p>
                </div>
              )}

              {/* Global Online Results */}
              {globalResults.length > 0 && (
                  <>
                    <div className="col-span-full pt-6 pb-2 border-t border-slate-200">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" /> Online Search Results
                        </h3>
                    </div>
                    {globalResults.map(song => (
                        <div key={song.id} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">Online</span>
                            </div>
                            <h3 className="font-bold text-slate-900">{song.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 font-medium">{song.artist}</p>
                            <button 
                                onClick={() => importSong(song)}
                                disabled={isImporting === song.id}
                                className="w-full py-2 bg-white border border-blue-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn shadow-sm"
                            >
                                {isImporting === song.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <PlusCircle className="w-3 h-3" />
                                )}
                                {isImporting === song.id ? 'Importing...' : 'Add to My Library'}
                            </button>
                        </div>
                    ))}
                  </>
              )}
            </div>
          </div>

          <div className={`lg:w-96 fixed inset-0 lg:relative z-40 transition-transform lg:translate-x-0 ${
            showMobileLineup ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className={`absolute inset-0 bg-slate-900/40 lg:hidden`} onClick={() => setShowMobileLineup(false)}></div>
            <div className="bg-white h-full lg:h-auto lg:rounded-3xl border-l lg:border border-slate-200 shadow-xl overflow-hidden sticky lg:top-24 w-[280px] sm:w-[350px] ml-auto lg:ml-0 flex flex-col">
              <div className="bg-slate-900 p-6 text-white flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowMobileLineup(false)} className="lg:hidden p-1 hover:bg-slate-800 rounded-md">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                Service Lineup
                            </h2>
                        </div>
                        <button onClick={clearLineup} className="p-1 hover:bg-red-500/20 rounded-md text-slate-400 transition-all" title="Clear All">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Select Role</label>
                            <select 
                                value={lineupRole} 
                                onChange={(e) => {
                                    setLineupRole(e.target.value);
                                    if (e.target.value !== 'Worship Leader') setLineupTheme('');
                                }}
                                className="w-full bg-slate-800 text-white text-sm rounded-xl p-2.5 border border-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            >
                                <option value="" disabled hidden>-- Pagpili og Role --</option>
                                <option value="Moderator">Moderator</option>
                                <option value="Worship Leader">Worship Leader</option>
                                <option value="All">All Roles (Admin)</option>
                            </select>
                        </div>
                        {lineupRole === 'Worship Leader' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Worship Theme (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Faith, Joy, Hope..."
                                    value={lineupTheme}
                                    onChange={(e) => setLineupTheme(e.target.value)}
                                    className="w-full bg-slate-800 text-white text-sm rounded-xl p-2.5 border border-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                                />
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 space-y-4 flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-350px)] lg:max-h-[60vh]">
                  {lineupRole ? (
                      <>
                        <p className="text-[10px] text-slate-400 mb-2 font-medium px-2 italic">Click a slot to choose a song</p>
                        {lineupSlots.map((slot) => (
                          <div 
                            key={slot.id} 
                            onClick={() => handleSlotClick(slot)}
                            className={`cursor-pointer transition-all duration-200 rounded-2xl border-2 ${
                                activeSlotId === slot.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-slate-100 hover:border-slate-200 bg-white'
                            }`}
                          >
                          <div className="p-4">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{slot.label}</span>
                                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                      {slot.songs.length} songs
                                  </span>
                              </div>
                              
                              {slot.songs.length > 0 ? (
                                  <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                      {slot.songs.map((song) => {
                                          const albumInfo = albumCache[song.id];
                                          const ytThumb = youtubeThumbnails[song.id];
                                          return (
                                          <div key={song.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl group/song relative">
                                              {ytThumb || albumInfo?.artUrl ? (
                                                  <img 
                                                      src={ytThumb || albumInfo.artUrl} 
                                                      alt={song.title}
                                                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 flex-shrink-0 shadow-sm"
                                                      onError={(e) => { e.target.style.display='none'; }}
                                                  />
                                              ) : (
                                                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                      <Music className="w-4 h-4" />
                                                  </div>
                                              )}
                                              <div className="flex-1 min-w-0">
                                                  <p className="text-xs font-bold text-slate-900 truncate">{song.title}</p>
                                                  <p className="text-[10px] text-slate-500 truncate">
                                                      {albumInfo?.albumName ? albumInfo.albumName : song.artist}
                                                  </p>
                                              </div>
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); removeSongFromSlot(slot.id, song.id); }}
                                                  className="opacity-0 group-hover/song:opacity-100 p-1 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-md transition-all flex-shrink-0"
                                              >
                                                  <X className="w-3 h-3" />
                                              </button>
                                          </div>
                                          );
                                      })}
                                  </div>
                              ) : (
                                  <div className="flex items-center gap-3 text-slate-300 italic group">
                                      <div className="w-8 h-8 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center group-hover:border-blue-300 transition-colors">
                                          <Plus className="w-4 h-4" />
                                      </div>
                                      <span className="text-xs">Add songs...</span>
                                  </div>
                              )}
                          </div>
                        </div>
                      ))}
                      </>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-10 opacity-60">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                              <CheckCircle2 className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-slate-600 mb-2">Kinsa man ka?</p>
                          <p className="text-xs text-slate-400">Palihug pagpili og role (Moderator o Worship Leader) sa ibabaw para makasugod na ta sa Lineup.</p>
                      </div>
                  )}
              </div>


              <div className="p-6 bg-slate-50 border-t border-slate-200">
                <button 
                  onClick={shareLineup}
                  disabled={lineupSlots.every(s => s.songs.length === 0)}
                  className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:bg-slate-300 ${
                    showCopied ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-900 hover:bg-black text-white'
                  }`}
                >
                  {showCopied ? (
                    <><CheckCircle2 className="w-5 h-5" /> Copied to Clipboard!</>
                  ) : (
                    <><Share2 className="w-5 h-5 text-blue-400" /> Confirm & Share</>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-3 font-medium">
                  {showCopied ? (
                    'Nakuha na ang lineup! Pwede na nimo i-paste.'
                  ) : (
                    'I-click para ma-copy ang lineup.'
                  )}
                </p>

                {showCopied && (
                    <div className="mt-4 grid grid-cols-2 gap-2 animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={openMessenger}
                            className="flex flex-col items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all group"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-1 shadow-md group-hover:scale-110 transition-transform">
                                <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[10px] font-bold text-blue-700">Open Messenger</span>
                        </button>
                        <button 
                            onClick={shareToWhatsApp}
                            className="flex flex-col items-center justify-center p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all group"
                        >
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mb-1 shadow-md group-hover:scale-110 transition-transform">
                                <Share2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[10px] font-bold text-green-700">Post to WhatsApp</span>
                        </button>
                    </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Lineup Confirmation & Preview Modal */}
      {showPreview && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-[85vh] md:h-auto">
                  
                  {/* Left Side: Visual Review */}
                  <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                              <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                              <h3 className="text-xl font-black text-slate-900">Final Review</h3>
                              <p className="text-xs text-slate-500 font-medium">Siguroha nga husto ang tanang songs.</p>
                          </div>
                      </div>

                      <div className="space-y-6">
                        {lineupSlots.map(slot => (
                            slot.songs.length > 0 && (
                                <div key={slot.id} className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{slot.label}</span>
                                    <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                                        {slot.songs.map(song => {
                                          const albumInfo = albumCache[song.id];
                                          const ytThumb = youtubeThumbnails[song.id];
                                          return (
                                            <div key={song.id} className="p-3 flex items-center gap-3">
                                                {ytThumb || albumInfo?.artUrl ? (
                                                    <img 
                                                        src={ytThumb || albumInfo.artUrl} 
                                                        alt={song.title}
                                                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                                                        onError={(e) => { e.target.style.display='none'; }}
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                                                        <Music className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900">{song.title}</p>
                                                    <p className="text-[10px] text-slate-500">{song.artist} • Key: {song.key}</p>
                                                    {albumInfo?.albumName && (
                                                        <p className="text-[10px] text-blue-500 font-medium truncate">💿 {albumInfo.albumName}</p>
                                                    )}
                                                </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                </div>
                            )
                        ))}
                      </div>
                  </div>

                  {/* Right Side: Share Actions */}
                  <div className="w-full md:w-80 p-8 bg-white border-l border-slate-100 flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Share Ready</span>
                        <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                          Mao kini ang text nga i-paste nimo sa Messenger:
                      </p>
                      
                      <div className="flex-1 relative mb-6">
                          <textarea 
                            readOnly
                            className="w-full h-full p-4 bg-slate-900 text-green-400 font-mono text-[10px] rounded-2xl border-none focus:ring-0 resize-none shadow-inner"
                            value={lineupText}
                          />
                          <button 
                            onClick={() => {
                                navigator.clipboard.writeText(lineupText);
                                setShowCopied(true);
                                setTimeout(() => setShowCopied(false), 2000);
                            }}
                            className="absolute bottom-3 right-3 p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1.5 text-[10px] font-bold"
                          >
                              {showCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {showCopied ? 'Copied!' : 'Copy'}
                          </button>
                      </div>

                      {/* YouTube Playlist Generator */}
                      <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl">
                          <p className="text-[10px] font-bold text-red-700 mb-2 uppercase tracking-wider">🎵 YouTube Playlist</p>
                          <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                              I-generate ang usa ka playlist link. Pag-click sa link, mag-play dayon ang tanang kanta sunod-sunod sa YouTube!
                          </p>
                          {youtubePlaylistUrl ? (
                              <div className="space-y-2">
                                  <div className="flex items-center gap-2 p-2 bg-white border border-green-200 rounded-xl">
                                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                      <p className="text-[9px] text-green-700 font-bold truncate flex-1">Playlist ready!</p>
                                      <button
                                          onClick={() => { navigator.clipboard.writeText(youtubePlaylistUrl); }}
                                          className="text-[9px] bg-green-100 text-green-700 px-2 py-1 rounded-lg font-bold hover:bg-green-200 transition-all flex-shrink-0"
                                      >
                                          Copy Link
                                      </button>
                                  </div>
                                  <button
                                      onClick={() => window.open(youtubePlaylistUrl, '_blank')}
                                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-red-500/20"
                                  >
                                      <PlayCircle className="w-4 h-4" /> Open Playlist sa YouTube
                                  </button>
                              </div>
                          ) : (
                              <button
                                  onClick={generateYouTubePlaylist}
                                  disabled={isGeneratingPlaylist}
                                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-red-500/20"
                              >
                                  {isGeneratingPlaylist ? (
                                      <><Loader2 className="w-4 h-4 animate-spin" /> Gina-search ang mga kanta...</>
                                  ) : (
                                      <><PlayCircle className="w-4 h-4" /> Generate YouTube Playlist</>
                                  )}
                              </button>
                          )}
                      </div>

                      <div className="space-y-3">
                          <button 
                            onClick={openMessenger}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                              <ExternalLink className="w-4 h-4" /> Open Messenger
                          </button>
                          <button 
                            onClick={shareToWhatsApp}
                            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                              <Share2 className="w-4 h-4 text-green-600" /> WhatsApp
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default App;
