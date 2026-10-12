import { CATEGORY_KO, CITY_KO, INTERLUDE_KO } from './locale-ko.js';
// The 55 cities, in the order Marco Polo describes them to Kublai Khan.
// Texts are original paraphrases written for this atlas, not quotations from the book.

export const CATEGORIES = [
  { id: 'memory', short: 'Memory', name: 'Cities & Memory', color: '#e3a857', glyph: '◐' },
  { id: 'desire', short: 'Desire', name: 'Cities & Desire', color: '#e07186', glyph: '❦' },
  { id: 'signs', short: 'Signs', name: 'Cities & Signs', color: '#4fbcae', glyph: '⌘' },
  { id: 'thin', short: 'Thin', name: 'Thin Cities', color: '#a7cdf0', glyph: '⟊' },
  { id: 'trading', short: 'Trading', name: 'Trading Cities', color: '#ef9440', glyph: '⚖' },
  { id: 'eyes', short: 'Eyes', name: 'Cities & Eyes', color: '#a98ae0', glyph: '◉' },
  { id: 'names', short: 'Names', name: 'Cities & Names', color: '#9cc26f', glyph: '✎' },
  { id: 'dead', short: 'The Dead', name: 'Cities & the Dead', color: '#c9c1b3', glyph: '✝' },
  { id: 'sky', short: 'The Sky', name: 'Cities & the Sky', color: '#7d9cff', glyph: '✦' },
  { id: 'continuous', short: 'Continuous', name: 'Continuous Cities', color: '#d0664a', glyph: '∞' },
  { id: 'hidden', short: 'Hidden', name: 'Hidden Cities', color: '#5fd394', glyph: '◈' },
];

for (const c of CATEGORIES) {
  c.originalName = c.name;
  [c.short, c.name] = CATEGORY_KO[c.id];
}

export const CAT = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, { ...c, index: i }]));

// [name, category, number-within-category, motif, text]
const RAW = [
  // ─── Chapter I ───
  ['Diomira', 'memory', 1, 'A city envied for an evening already lived',
    'Sixty silver domes, bronze gods on every corner, streets paved in lead, a crystal theatre, a golden rooster that crows from a tower each dawn. Other cities have such marvels. Diomira’s gift is stranger: arrive on a September evening, as the lamps are lit above the food stalls and a woman calls out from a terrace, and you find yourself envying those who once lived an evening exactly like this one, and were happy.'],
  ['Isidora', 'memory', 2, 'The city of youth’s dreams, reached in old age',
    'Spiral stairs crusted with seashells; spyglasses and violins made to perfection; a stranger torn between two women always meets a third. This was the city a young man dreamed of. He reaches it old. In the square there is a wall where the old men sit and watch the young pass by, and he sits among them. His desires have already become memories.'],
  ['Dorothea', 'desire', 1, 'Every possibility, counted out in quarters',
    'Four aluminium towers, seven gates with drawbridges, a moat feeding four green canals that cut the city into nine quarters, each with its fixed number of houses and chimneys. A camel driver remembers arriving as a youth: the quarters, the girls, the bazaars seemed to hold every future. Later he understood that the possibilities had been a few, and that the city had laid them out like a map he would follow for the rest of his life.'],
  ['Zaira', 'memory', 3, 'A city made of the relations between its measurements and its past',
    'You could count Zaira’s arches and stairs, but that would tell you nothing. The city is made of relationships: the height of a lamppost and the dangling feet of a hanged usurper; a rope from that lamppost to a railing, and the path of an adulterer at dawn. Zaira soaks up memory like a sponge and swells with it. It does not tell its past; it holds it, like the lines of a hand, written on banisters, gratings, lightning rods and flagpoles, every inch of them scratched and notched.'],
  ['Anastasia', 'desire', 2, 'A city that enslaves you through your desires',
    'Concentric canals, kites overhead, agate and chrysoprase for sale, pheasant roasting over cherrywood, women bathing in a garden pool. Every desire wakes at once, and the city seems to grant all of them together, with you inside it. But you spend eight hours a day cutting agate and onyx, and the labour that shapes the city’s desires takes the form of desire. You believe you are enjoying Anastasia when you are only its slave.'],
  ['Tamara', 'signs', 1, 'Signs that stand for other signs',
    'You walk for days among trees and stones that rarely mean anything. Then Tamara: every object is an image of something else. Pincers mean the tooth-drawer, a tankard the tavern, halberds the barracks, scales the grocer. Statues and shields show lions, dolphins, towers, stars — signs that something has a lion or a dolphin for its sign. The eye reads streets like written pages; the city tells you what to think. You leave without having discovered what lies beneath the dense wrapping of signs.'],
  ['Zora', 'memory', 4, 'Unforgettable, and therefore gone',
    'Whoever has seen Zora never forgets it, not for any beauty but because its streets follow one another like the notes of a score: the barber’s striped awning, the clock, the fountain with nine jets, the astronomer’s glass tower, the melon seller’s kiosk. Scholars use it as a memory palace, filing their knowledge in its corners. But obliged to stay motionless and always the same in order to be remembered, Zora languished, crumbled and vanished. The earth has forgotten her.'],
  ['Despina', 'desire', 3, 'A ship to the camel driver, a camel to the sailor',
    'Despina is reached two ways. The camel driver sees on the horizon spires, antennas, windsocks and smokestacks, and takes it for a ship that will carry him off the sand. The sailor sees through the coastal haze the shape of a camel’s hump, an embroidered saddle, and imagines the caravan that will take him away from the sea. Each city takes its shape from the desert it opposes; Despina stands at the border between two deserts.'],
  ['Zirma', 'signs', 2, 'Memory is redundant: it repeats signs so the city can exist',
    'Travellers return with clear memories: a blind man shouting in the crowd, a lunatic teetering on a skyscraper’s cornice, a girl walking a puma on a leash. In truth there are many blind men, many lunatics, many girls with pumas; airships drift past the windows at every height. The city is redundant: it repeats itself so that something will stick in the mind. Marco, too, remembers Zirma — and his memory repeats it.'],
  ['Isaura', 'thin', 1, 'A city of a thousand wells over a hidden lake',
    'Isaura is said to sit above a deep underground lake. Wherever its people drill a long vertical shaft, they draw up water, and so the green edge of the city traces the dark outline of the buried lake. There are two religions. Some say the gods live below, in the black water; others say they live in the buckets that rise on ropes, in the pulleys, windlasses, pumps and spouts, in the weather vanes that turn on the tall wells. All of Isaura moves upward.'],

  // ─── Chapter II ───
  ['Maurilia', 'memory', 5, 'The city that only exists in its old postcards',
    'Visitors are invited to tour the city and, at the same time, to study old postcards of how it used to be: the same square with a hen where the bus station stands, a bandstand instead of the overpass, two ladies with white parasols in place of the munitions factory. Residents praise the vanished grace of the old town, yet it was poorer then. Perhaps different cities follow one another on the same ground under the same name, born and dead without knowing each other.'],
  ['Fedora', 'desire', 4, 'A metropolis and its crystal globes of unrealised futures',
    'At the heart of grey Fedora stands a metal building where, in every room, a crystal globe holds a little blue city: a model of Fedora as it might have been. In every age someone looked at the city, imagined how to make it ideal, and built a model — but by the time it was done, Fedora had changed, and the model became a toy in a globe. The Khan’s atlas must hold both the great stone city and the small ones in glass: not because all are real, but because all are only assumptions.'],
  ['Zoe', 'signs', 3, 'The indivisible city',
    'A traveller in Zoe cannot tell where he is. Which is the palace, which the temple, the market, the prison? Every point can serve for sleeping, forging tools, cooking, hoarding gold, undressing, reigning, selling, consulting oracles. Any roof could be a harem or a temple. Why then is it a city at all? What line separates the inside from the outside, the rumble of wheels from the howl of wolves?'],
  ['Zenobia', 'thin', 2, 'A city on stilts that is everyone’s picture of happiness',
    'Though it stands on dry ground, Zenobia rises on tall pilings: bamboo and zinc houses, catwalks and balconies at every height, ladders and hanging walkways, belvederes with conical roofs, water tanks, weather vanes, cranes and fishing poles. Nobody remembers what need first drove its founders. Ask anyone to describe a happy life and they will imagine a city like Zenobia, pilings and stairways and all. It is pointless to sort cities into happy and unhappy; the true division is between cities that go on giving shape to desires, and those where desires erase the city or are erased by it.'],
  ['Euphemia', 'trading', 1, 'A market of memories exchanged at the solstice',
    'Merchants of seven nations meet here at every solstice and equinox. Boats unload ginger and cotton, caravans bring nutmeg and raisins. But what draws them is not only trade. At night, around the fires of the market, seated on sacks and barrels and heaps of carpets, someone says a word — “wolf”, “sister”, “hidden treasure”, “battle” — and each in turn tells his own tale of wolves and sisters and battles. When you leave Euphemia, you carry home memories that are not yours, traded at the solstice like spice.'],

  // ─── Chapter III ───
  ['Zobeide', 'desire', 5, 'A trap built from a shared dream',
    'Men of many nations had the same dream: a woman running at night through an unknown city, seen from behind, her long hair loose. Each chased her and lost her. Waking, they searched for that city, found only each other, and built it as in the dream, each laying a street along the path of his pursuit, and closing walls where the fugitive had escaped, so she could not escape again. She never came. New men arrived with the same dream, recognised the streets, and rebuilt arcades and stairways nearer to their memory. Zobeide grew into an ugly city, a trap.'],
  ['Hypatia', 'signs', 4, 'Signs form a language, but not the one you think',
    'He came looking for beauty and found ruin where he had expected it, and beauty in places no sign pointed to. In Hypatia nothing is where its emblem says: the lagoon promises bathers and hides the drowned; the library holds no wisdom; the philosopher is found in the playground. You must unlearn the alphabet and its order. Signs form a language here, but not the one you believe you know; and there is no language without deceit.'],
  ['Armilla', 'thin', 3, 'A city of nothing but water pipes, inhabited by nymphs',
    'Whether it was left unfinished, or demolished, or enchanted, Armilla has no walls, no ceilings, no floors. It has only its plumbing: pipes rising where houses should be and branching where floors should be, a forest of tubes ending in taps, showers, spouts and overflows. White basins stand out against the sky; bathtubs hang like late fruit. In the sun glitter slender young women bathing, perhaps water nymphs who lost their rivers and moved into the pipes.'],
  ['Chloe', 'trading', 2, 'The most chaste city, trembling with imagined encounters',
    'In Chloe everyone in the street is a stranger. At each meeting they imagine a thousand things about one another: conversations, surprises, caresses, bites. No one greets anyone; glances lock for a second and dart away. Between them invisible threads are stretched, crossing and forming figures — arrows, stars, triangles — until the whole city vibrates. If they ever lived out their fleeting dreams, every phantom would become a person, a story of pursuits and misunderstandings, and the carousel of fantasies would stop.'],
  ['Valdrada', 'eyes', 1, 'A city and its reflection, which do not love each other',
    'The ancients built Valdrada on the shore of a lake, its houses all verandas stacked one above another. The traveller sees two cities: one standing above the water, one hanging upside down below it. Nothing happens in one that the other does not repeat, and the people know that every act of theirs is both the act and its mirror image, which has its own dignity. The two Valdradas live for each other, their eyes locked, but there is no love between them.'],

  // ─── Chapter IV ───
  ['Olivia', 'signs', 5, 'The lie is never in the words, but in the things',
    'To describe prosperous Olivia, Marco could only speak of filigree palaces, fringed cushions in the window seats, a peacock opening its tail in a courtyard. From these words you would understand that Olivia is wrapped in soot and grease, that its streets are jammed and its factories roar. The words that describe a city are not the city; yet the falsehood is never in the words — it is in the things themselves.'],
  ['Sophronia', 'thin', 4, 'Two half-cities, one of which is a fairground',
    'Sophronia is made of two halves. In one stand the great roller coaster with its steep humps, the carousel with its chains, the Ferris wheel of spinning cages, the circus tent with trapezes hanging in the middle. The other half is of stone, marble and cement: the bank, the factories, the palaces, the slaughterhouse, the school. One half is permanent, the other temporary. Each year the workmen dismantle the stone half — the ministry, the monument, the docks — and load it onto trailers, while the fairground half stays put, counting the days until the caravan returns.'],
  ['Eutropia', 'trading', 3, 'Many identical cities; the people move when they tire of their lives',
    'Eutropia is not one city but many, of equal size and much alike, scattered across a wide rolling plateau. Only one is inhabited at a time. When its people tire of their work, their families, their streets and their debts, they move to the next empty city, where each takes a new job, a new spouse, a new view from the window. So life is renewed from move to move, among cities that differ only in their slope or the bend of a river. The city repeats its life, shifting up and down its empty chessboard.'],
  ['Zemrude', 'eyes', 2, 'A city whose shape depends on the mood of the beholder',
    'The shape of Zemrude depends on your mood. Walk whistling, nose in the air, and you know it from below upward: windowsills, fluttering curtains, fountains. Walk with your nails digging into your palms and your gaze stays on the ground: gutters, manhole covers, fish scales, waste paper. You cannot say one is truer than the other, but you hear of the upper Zemrude mostly from those who remember it as they sink into the lower one, and sooner or later everyone’s gaze falls to the gutters.'],
  ['Aglaura', 'names', 1, 'The city spoken of and the city that exists',
    'Marco can tell little of Aglaura beyond what its own people always say: a list of proverbial virtues and equally proverbial faults, a few oddities, some respectful regard for the rules. No observer doubts these words, yet the Aglaura they describe and the Aglaura one sees do not match. At rare moments, in a certain slant of light, something rare and splendid flashes in it — but that is something no one has ever named. The city that is spoken of has much of what is needed to exist; the city that exists has less.'],

  // ─── Chapter V ───
  ['Octavia', 'thin', 5, 'The spider-web city, hung over the void',
    'A precipice between two steep mountains: the city hangs over the void, bound to the crests with ropes, chains and catwalks. You walk on wooden ties, careful not to step into the gaps; below there is nothing for hundreds of feet, a few clouds gliding past, and farther down the bed of the chasm. A net is the foundation — and everything else, instead of rising, hangs beneath it: rope ladders, hammocks, houses like sacks, terraces like gondolas, waterskins, baskets on strings, trapezes and rings for children’s games. Life in Octavia is less uncertain than elsewhere: its people know the net will last only so long.'],
  ['Ersilia', 'trading', 4, 'A city of strings that marks every relationship',
    'To mark the relationships that sustain the city, Ersilia’s people stretch strings from the corners of houses — white, black, grey, or black-and-white — for kinship, trade, authority, agency. When the strings are so many that no one can pass, they leave: the houses are taken apart, and only the strings and their supports remain. From a hillside the refugees look back at the labyrinth of taut lines rising from the plain. Then they build Ersilia again elsewhere, a web more complex and more regular. Travelling, you find the ruins of abandoned Ersilias: no walls, no bones, only spiderwebs of relations seeking a form.'],
  ['Baucis', 'eyes', 3, 'A city on stilts above the clouds, contemplating its own absence',
    'After seven days through woodland the traveller cannot see Baucis, though he has arrived. Slender stilts rise far apart from the ground and vanish above the clouds: they hold up the city. Its people rarely come down; they have everything they need up there. Nothing touches the earth but those long flamingo legs, and on sunny days a pierced, angular shadow on the leaves. Perhaps they hate the earth; perhaps they revere it too much to touch it; or perhaps they love it as it was before them, and with spyglasses trained downward they study it leaf by leaf, stone by stone, ant by ant, contemplating with fascination their own absence.'],
  ['Leandra', 'names', 2, 'Two kinds of household gods argue about its essence',
    'Gods of two species protect Leandra, both too small to be seen and too many to count. One kind lives by the front door, near the coat rack; when a family moves, they move with it. The other lives in the kitchen, under pots, in the chimney flue, in the broom closet; they belong to the house, and stay when the family leaves. Both claim to be the true soul of the city, and at night they argue about what Leandra really is — the first speaking of what it was, the second of what it will be.'],
  ['Melania', 'dead', 1, 'A dialogue that outlives everyone who speaks it',
    'Each time you enter the square of Melania you find yourself in the middle of a dialogue: the boasting soldier and the parasite meet the spendthrift youth and the courtesan; the miserly father warns his lovesick daughter, contradicted by the foolish servant. Come back years later and the same dialogue is still going on. Meanwhile the parasite has died, the old men have been replaced by their heirs: the people of Melania renew themselves, each role taken over in turn, so the dialogue goes on even though no life lasts long enough to hear it end.'],

  // ─── Chapter VI ───
  ['Esmeralda', 'trading', 5, 'Water and land routes woven together — map them in many inks',
    'In Esmeralda, city of water, a network of canals and a network of streets overlap and cross. Between two points you always have the choice of land or boat, and the shortest route is never a straight line but a zigzag that branches into countless options: stairs, landings, humpback bridges, hanging streets. Above, cats, thieves and secret lovers move along rooftops; below, sewers and tunnels carry rats and conspirators. A map of Esmeralda would need inks of many colours — and the routes of the swallows, cutting the air above the roofs.'],
  ['Phyllis', 'eyes', 4, 'A city of countless bridges and windows, which fades as you stay',
    'Arriving, you rejoice at its bridges, each different — humped, covered, on pillars, on barges, suspended — and its windows: mullioned, Moorish, lancet, pointed, crowned with lunettes and rose windows. Happy the one who sees Phyllis every day and never stops seeing it. But stay, and the city fades: your eyes pick the few routes you need among the infinite ones, and everything else goes dark. Millions of eyes look up at its windows, bridges and capers, and they might as well be scanning a blank page.'],
  ['Pyrrha', 'names', 3, 'A name that once meant a different city',
    'For years Marco imagined Pyrrha as a fortified town on the slopes of a bay, with high windows and towers, closed like a goblet, with a deep square like a well and a fountain at its centre. Then he went there, and everything he had imagined vanished at once. Pyrrha became what it is: a seaside town, flat and windy, low houses strung along the shore. Now the name means only this. And the cities he imagined under other names are lost too.'],
  ['Adelma', 'dead', 2, 'Every face resembles someone already dead',
    'Arriving at dusk by boat, Marco watches the dock: a sailor catching a rope, an old man loading baskets of sea urchins, a woman haggling over a pumpkin. Each face resembles someone he knew who is dead. Perhaps Adelma is the city one reaches in dying, where everyone meets the people they knew. Perhaps, at a certain point in life, among the people you have known the dead outnumber the living, and the mind refuses to accept any new faces, stamping old ones on everyone it meets.'],
  ['Eudoxia', 'sky', 1, 'A carpet that holds the true shape of the city',
    'Eudoxia sprawls up and down, all crooked lanes, stairways, dead ends and hovels; but a carpet is kept there in which you can see the city’s true form. At first nothing looks less like Eudoxia than its pattern of symmetrical motifs in straight and circular lines. Look longer and every place in the city has its place in the carpet, arranged in their true relationships. An oracle said one of the two has the shape the gods gave the starry sky, the other is its approximate human reflection. It has long been assumed the carpet is the divine one. But one could equally conclude the reverse: that the true map of the universe is Eudoxia itself, a stain that spreads out shapelessly.'],

  // ─── Chapter VII ───
  ['Moriana', 'eyes', 5, 'A city with a face and an obverse, like a sheet of paper',
    'Ford the river and cross the pass and Moriana appears: alabaster gates translucent in the sun, coral columns, glass villas like aquariums where the shadows of dancing girls with silvery scales swim beneath jellyfish chandeliers. But cities like this have an obverse. Walk a half circle and you see the hidden face: rusting sheet metal, sackcloth, nail-studded planks, sooty pipes, heaps of tins, blind walls with faded signs. The city has no thickness: only a face and a back, like a sheet of paper, with a picture on each side that can neither be separated nor look at one another.'],
  ['Clarice', 'names', 4, 'A glorious city rebuilt from its own fragments, again and again',
    'Clarice has decayed and flourished many times, always holding its first self as the model of splendour. After plagues and earthquakes the survivors crawled from cellars and rebuilt with what was left: a capital became a chicken coop, a marble frieze a flowerpot. Then prosperity returned and the old fragments were set in glass cases as precious relics. Through all its lives Clarice has only shuffled the same pieces into new arrangements. Perhaps it was never more than a jumble of chipped and mismatched things.'],
  ['Eusapia', 'dead', 3, 'A living city copied underground for the dead — or the other way round',
    'No city loves life more than Eusapia. To soften the leap from life to death, its people built an exact copy of their city underground, where the dried bodies continue their former occupations at their old tables and workbenches. A hooded brotherhood carries the dead below and reports that they, too, are changing their city; and the living, not to be outdone, copy them. So, they say, it may well be the dead who built the Eusapia above in their own image, and in the twin cities there is no telling who is alive and who is dead.'],
  ['Beersheba', 'sky', 2, 'A heaven of gold above, a pit of refuse below — and the truth reversed',
    'The people of Beersheba believe that above them floats a celestial city of pure gold, with silver locks and diamond gates, and that if they model themselves on it the two will become one. They believe too that beneath them lies an infernal city of everything base and rotten. But they are mistaken. The city of gold they strive to imitate is the true hell, a hoard sealed by avarice; and the celestial Beersheba is the one their thoughtless moments release — peels and scraps and broken things flung into the sky, a bright comet of waste turning among the stars, the only moments when the city is free.'],
  ['Leonia', 'continuous', 1, 'A city buried by its own refuse',
    'Leonia remakes itself every day: every morning its people wake in fresh sheets, wash with soap just unwrapped, open a refrigerator of brand-new tins. On the pavements, in spotless plastic bags, yesterday’s Leonia waits for the garbage truck. Its wealth is measured less by what it makes than by what it throws away. Each year the city grows, the dumps recede and rise, layer upon layer, until a mountain range of indestructible refuse surrounds Leonia on every side — pressed against the refuse of other cities. One landslide, and all of it would be buried.'],

  // ─── Chapter VIII ───
  ['Irene', 'names', 5, 'A city seen only from the plateau, which changes as you approach',
    'Irene is the city you see when you lean over the edge of the plateau at the hour the lamps come on: in the clear air its pink glow spreads across the plain below, thicker where windows crowd, thinning into dim alleys. The people of the plateau wonder what life is like down there. They never go. Seen from inside it would be a different city; Irene is the name of a city in the distance, which changes as you approach it. Perhaps Marco has spoken of Irene already, under other names.'],
  ['Argia', 'dead', 4, 'A city with earth instead of air',
    'What makes Argia different is that it has earth instead of air. Its streets are filled with packed soil, clay fills its rooms to the ceiling, every staircase has a negative staircase pressed over it, and above the roofs hang layers of rock like skies with clouds. Whether its people move about by widening worm holes and crevices, no one knows. From above nothing can be seen. Some say it is down there, and we can only believe them. At night, with your ear to the ground, you sometimes hear a door slam.'],
  ['Thekla', 'sky', 3, 'A city forever under construction, after the blueprint of the stars',
    'Arriving, you see little of Thekla behind plank fences, sackcloth screens, scaffolding, metal armatures, catwalks hanging from ropes, ladders and trestles. Why is the building taking so long? “So that its destruction cannot begin,” they answer. Asked to show the plan they are following, they say: wait until dark. At sunset the work stops; night falls over the building site; it is a starry night. “There is the blueprint,” they say.'],
  ['Trude', 'continuous', 2, 'The same city everywhere, only the airport name changes',
    'Had Marco not read the name in big letters as he landed, he would have thought he was back at the airport he left. The suburbs were the same, the same green and yellow houses, the same signs, the same flowerbeds in the same squares; downtown, the same goods in the same windows. He wanted to leave at once. “You can take off whenever you like,” they told him, “but you will arrive at another Trude, the same in every detail. The world is covered by one Trude, without beginning or end. Only the name of the airport changes.”'],
  ['Olinda', 'hidden', 1, 'A city growing in concentric circles from within',
    'Hunt with a magnifying glass and you may find a point no bigger than a pinhead that, enlarged, shows roofs, antennas, skylights, gardens and pools. A year later it is the size of a lemon, then a mushroom, then a soup plate; then a full city, enclosed within the earlier one, pushing it outward. Unlike other cities, whose old walls stay at the centre, in Olinda the old walls expand, carrying the old quarters with them, while the newest Olinda — already holding the next one, too small to see — keeps blossoming at the heart.'],

  // ─── Chapter IX ───
  ['Laudomia', 'dead', 5, 'Three cities: the living, the dead and the unborn',
    'Like every city, Laudomia has beside it another city whose people bear the same names: the Laudomia of the dead, the cemetery. But Laudomia also has a third city, that of the unborn. Its proportions bear no relation to the other two: the dead grow in number, but the unborn are numberless, crowded into every niche, as fine as grains of sand. The living visit both, to ask the dead and the unborn about themselves, and learn little; the more the city grows, the more the city of the unborn swells, and the living feel themselves no more than a thin moment between.'],
  ['Perinthia', 'sky', 4, 'Built by the stars’ plan — and populated by monsters',
    'When Perinthia was founded, astronomers chose the place and day by the stars, drew the city’s axes along the sun and moon, and divided the map by the twelve houses of the zodiac so that every temple and quarter would receive the right celestial influence. The city was meant to mirror the harmony of the firmament. A generation later its streets are full of cripples, dwarfs, hunchbacks; from cellars come howls of children hidden for their six legs or three heads. The astronomers face a choice: admit their calculations were wrong, or reveal that the order of the gods is reflected exactly in the city of monsters.'],
  ['Procopia', 'continuous', 3, 'Each year more faces fill the view from the same window',
    'Every year Marco stops at Procopia and takes the same room at the same inn. The first year, through the window: a ditch, a bridge, a little wall, a medlar tree, a field of corn, a bramble patch, a chicken yard, the yellow crest of a hill, a white cloud, a trapezoid of blue sky. The next year a face peers out of the leaves; the year after, six faces; then dozens, crowding the field, the bridge, the hill. In the last year there are twenty-six people in his room, and he can no longer see the landscape. At least they are very polite.'],
  ['Raissa', 'hidden', 2, 'An unhappy city that contains a happy one, unaware of itself',
    'Life in Raissa is not happy. People wring their hands, curse their children, read the news of disasters. And yet at every moment a child at a window laughs at a dog that has leapt onto a shed to catch a crumb dropped by a mason on the scaffolding, who calls to a girl, who smiles at a passer-by… An invisible thread binds one living being to another for an instant, then loosens and stretches between other moving points, drawing new and rapid patterns, so that at every second the unhappy city contains a happy city unaware of its own existence.'],
  ['Andria', 'sky', 5, 'A city that mirrors the sky — and whose every change alters the stars',
    'Andria was built so that each street follows a planet’s orbit and every building repeats the position of a constellation: Antares, Alpheratz, Capella, the Cepheids. Its calendar matches the firmament so that the days of the people mirror the nights of the stars. Yet the people never stop changing their city — a new observatory, a bridge, a square — convinced that each change alters the sky. And after every decision they watch the stars, and see a nova flare, a nebula shift. They have two virtues: confidence in themselves, and prudence.'],
  ['Cecilia', 'continuous', 4, 'The city that swallowed every pasture',
    'Years ago Marco met a goatherd driving his flock along Cecilia’s walls. “I don’t know cities,” the goatherd said. “For me they are places without leaves between one pasture and the next, where the goats get frightened at street corners.” Years later, lost among identical buildings, Marco meets him again, with only a few goats left. “We are in Cecilia, worse luck. I have been looking for a way out for years.” The pastures and the cities have run together. Cecilia is everywhere.'],
  ['Marozia', 'hidden', 3, 'The city of rats, with a city of swallows hidden inside',
    'A soothsayer said: Marozia is two cities, that of the rat and that of the swallow; both change, but their relation does not — the second is always about to free itself from the first. Marco found the city of rats: crowded tunnels, people shoving with sharp teeth. And yet, now and then, someone in the crowd stops, smiles, a window opens — and for an instant the walls part, the city of swallows glimmers, and you could fly over it as if on wings. Then the moment passes. Perhaps the prophecy is right, but you must catch the instant when the crack opens.'],
  ['Penthesilea', 'continuous', 5, 'Endless outskirts with no centre — and no outside',
    'You travel for hours and cannot tell whether you are already in the city or still outside. Like a lake with low marshy shores, Penthesilea spreads for miles, a watery city diluted in the plain: pale buildings back to back in mangy fields among plank fences and corrugated sheds. Now and then a cluster of taller façades suggests a centre; you go there and find more periphery. You stop asking where Penthesilea is, and begin to wonder whether there is an outside — whether, however far you go, you will ever get out.'],
  ['Theodora', 'hidden', 4, 'A city cleansed of animals — until the fabulous beasts return',
    'Over the centuries Theodora suffered invasions: condors, then snakes, then spiders, then flies, then termites and woodworm, then rats, each species exterminated in turn until only humans remained, in a clean geometric order. But in the city’s library, among the bestiaries, the dethroned fauna was waiting. Sphinxes, griffins, chimeras, dragons, harpies, hydras, unicorns and basilisks, long dormant on the shelves, are stirring and emerging to take back their city.'],
  ['Berenice', 'hidden', 5, 'Just and unjust cities nested inside one another',
    'Rather than unjust Berenice, crowning its meat-grinders with marble friezes, Marco speaks of the hidden Berenice of the just, assembling makeshift wires and pulleys in back rooms and under stairs, a network climbing among the great cogwheels. But in the seed of the just city a malignant seed is hidden: the certainty of being right, which turns it unjust — and within that, again, a tiny seed of justice. The real Berenice is a succession of cities, alternately just and unjust, and all the future Berenices are already here, wrapped one inside the other, crammed and inseparable.'],
];

export const CITIES = RAW.map(([name, cat, n, motif, text], i) => ({
  id: name.toLowerCase(),
  name, cat, n, motif, text,
  order: i, // reading order 0..54
}));

for (const city of CITIES) {
  const ko = CITY_KO[city.id];
  if (!ko) continue;
  city.originalText = city.text;
  city.originalMotif = city.motif;
  Object.assign(city, ko, { text: ko.paragraphs.join('\n\n'), lang: 'ko' });
}

// Chapter membership (the book's nine chapters)
const CHAPTER_SIZES = [10, 5, 5, 5, 5, 5, 5, 5, 10];
{
  let k = 0;
  CHAPTER_SIZES.forEach((size, ch) => {
    for (let j = 0; j < size; j++) { CITIES[k].chapter = ch; CITIES[k].inChapter = j; k++; }
  });
}

export const CITY = Object.fromEntries(CITIES.map((c) => [c.id, c]));

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

// The frame story: dialogues between Marco Polo and Kublai Khan (paraphrased).
// `after` = shown after the last city of that chapter (−1 = prologue).
export const INTERLUDES = [
  { after: -1, title: 'The Empire at Dusk',
    text: 'Kublai Khan does not necessarily believe everything Marco Polo says of the cities he has visited on his missions, but the emperor of the Tartars listens to the young Venetian more attentively than to any other envoy. In the melancholy hour when an emperor learns that his boundless empire is only an endless, formless ruin, the reports of Marco Polo allow him to glimpse, through the walls and towers destined to crumble, the tracery of a pattern so fine it could escape the termites’ gnawing.' },
  { after: 0, title: 'Gestures and Objects',
    text: 'Newly arrived and ignorant of the languages of the Levant, Marco could speak only with gestures, leaps, cries of wonder or horror, and with objects drawn from his bags — ostrich plumes, peashooters, quartzes — which he set out before the Khan like chessmen. The emblems were hard to read: a quiver might mean a coming war, or an abundance of game, or an armourer’s shop. But the Khan found that what made them precious was precisely the empty space around each, left unfilled by words.' },
  { after: 1, title: 'Elsewhere Is a Negative Mirror',
    text: '“You return from your journeys with the memory of other cities,” said the Khan, “but is it the past you seek?” Marco answered that arriving at each new city the traveller finds again a past of his own he did not know he had. The foreignness of what you no longer are, or no longer possess, lies in wait for you in foreign, unpossessed places. Elsewhere is a negative mirror: the traveller recognises the little that is his, discovering the much he has not had and will never have.' },
  { after: 2, title: 'A Model City',
    text: 'Kublai said: “I have built in my mind a model city from which all possible cities can be deduced. It contains everything that corresponds to the norm.” Marco replied: “I, too, have thought of a model city, from which I deduce all the others. It is made only of exceptions, exclusions, incongruities, contradictions. If such a city is the most improbable, then by reducing its abnormal elements we increase the probability that the city really exists.” But he could not go too far, or the cities would become too probable to be true.' },
  { after: 3, title: 'The Bridge and the Arch',
    text: 'Marco describes a bridge, stone by stone. “But which is the stone that supports the bridge?” asks Kublai. “The bridge is not supported by one stone or another,” Marco answers, “but by the line of the arch that they form.” Kublai is silent, reflecting. Then: “Why do you speak to me of stones? It is only the arch that matters to me.” Marco answers: “Without stones there is no arch.”' },
  { after: 4, title: 'The Garden',
    text: 'Perhaps the conversation never took place in the palace at all. Perhaps the two of them sat in a garden of magnolias, smoking long amber pipes, so far from the world that every journey was only a game of the mind; or perhaps they were beggars rummaging in a rubbish heap, imagining an emperor and a traveller. Kublai asked whether Marco went on travelling only in order to return to his past. And Marco: “Memory’s images, once fixed in words, are erased. Perhaps I am afraid of losing Venice all at once if I speak of it — or perhaps, speaking of other cities, I have already lost it, little by little.”' },
  { after: 5, title: 'Every City Is Venice',
    text: '“There is still one city you never speak of,” said the Khan. Marco bowed: “Venice.” “Then why do you never mention it?” Marco smiled: “What else do you think I have been talking about? Every time I describe a city, I am saying something about Venice. To distinguish the qualities of the others, I must start from a first city that remains implicit. For me it is Venice.”' },
  { after: 6, title: 'The Chessboard',
    text: 'Kublai learned to play chess with Marco and thought that, knowing its rules, he would at last possess his empire. But reducing his conquests to their essence, he arrived at the final move: a square of planed wood. Then Marco spoke: the board is inlaid with ebony and maple; this square was cut from a trunk that grew in a year of drought — see how its fibres are arranged; here is a knot, a bud that tried to sprout on a premature spring day; here a pore that was once a larva’s nest. The quantity of things that could be read in a little piece of smooth, empty wood overwhelmed the Khan.' },
  { after: 7, title: 'The Atlas',
    text: 'The Great Khan owns an atlas in which all the cities of the earth are drawn, cities walled and unwalled, those that have been and those yet to be — cities with the shapes of Venice and Amsterdam, of Kyoto and Los Angeles, and cities not yet named, whose forms the Khan reads as if they were the empire’s future. “It is all useless, if the last landing place can only be the infernal city,” he said, “and it is there that, in ever-narrowing circles, the current is drawing us.”' },
  { after: 8, title: 'The Inferno of the Living',
    text: 'Marco answered: the inferno of the living is not something that will be; if there is one, it is what is already here, the inferno we live in every day, that we form by being together. There are two ways to escape suffering it. The first is easy for many: accept the inferno and become such a part of it that you can no longer see it. The second is risky and demands constant vigilance and learning: seek and learn to recognise who and what, in the midst of the inferno, are not inferno — then make them endure, and give them space.' },
];

for (const il of INTERLUDES) {
  il.originalTitle = il.title; il.originalText = il.text;
  Object.assign(il, INTERLUDE_KO[il.after], { lang: 'ko' });
}
