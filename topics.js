// topics.js - Question collections organized by topic category
const TOPIC_QUESTIONS = {
    // STEM Categories
    space: {
        displayName: "Space",
        emoji: "🚀",
        questions: [
            "How big is the universe?",
            "Why is space black?",
            "How many planets are in our solar system?",
            "What are black holes?",
            "How do stars form?",
            "Can humans live on Mars?",
            "What is the Milky Way?",
            "How old is the universe?",
            "What is the International Space Station?",
            "Are there other galaxies?"
        ]
    },
    math: {
        displayName: "Math",
        emoji: "🔢",
        questions: [
            "What is Graham's number?",
            "Can you explain infinity to me?",
            "What is tetration?",
            "What's the biggest number with a name?",
            "What is the Mandelbrot set?",
            "How do imaginary numbers work?",
            "What is the Fibonacci sequence?",
            "Can you explain prime numbers?",
            "What is a googolplex?",
            "How do fractals work?"
        ]
    },
    computers: {
        displayName: "Computers",
        emoji: "💻",
        questions: [
            "How do computers think?",
            "How does the internet work?",
            "What is coding?",
            "How do video games work?",
            "What is artificial intelligence?",
            "How do computers store information?",
            "Who invented the first computer?",
            "What is a computer virus?",
            "How fast can computers calculate?",
            "How does a computer chip work?"
        ]
    },
    weather: {
        displayName: "Weather",
        emoji: "⛈️",
        questions: [
            "How do tornadoes form?",
            "Why does lightning make thunder?",
            "How do hurricanes get their names?",
            "Why does it rain?",
            "What makes a rainbow appear?",
            "How do snowflakes form?",
            "What causes fog?",
            "Why is the sky blue?",
            "What is the coldest place on Earth?",
            "How do meteorologists predict the weather?"
        ]
    },
    chemistry: {
        displayName: "Chemistry",
        emoji: "🧪",
        questions: [
            "What are atoms made of?",
            "Why do some things glow in the dark?",
            "How does soap work?",
            "What happens when you mix baking soda and vinegar?",
            "Why does metal rust?",
            "How do fireworks get different colors?",
            "What's inside a battery?",
            "Why does ice float?",
            "What makes things sticky?",
            "How do invisible inks work?"
        ]
    },
    physics: {
        displayName: "Physics",
        emoji: "⚛️",
        questions: [
            "How do magnets work?",
            "Why do some things float and others sink?",
            "What is gravity?",
            "How does light travel?",
            "What is sound made of?",
            "How do airplanes fly?",
            "What is electricity?",
            "How does a pendulum work?",
            "What's inside an atom?",
            "Why do boomerangs come back?"
        ]
    },
    coding: {
        displayName: "Coding",
        emoji: "👩‍💻",
        questions: [
            "How do you make a video game?",
            "What is Python used for?",
            "How do websites work?",
            "What is an algorithm?",
            "How do apps get made?",
            "What is HTML?",
            "How do robots get programmed?",
            "What are coding languages?",
            "How do computers understand code?",
            "What is debugging?"
        ]
    },
    robots: {
        displayName: "Robots",
        emoji: "🤖",
        questions: [
            "How do robots move?",
            "Can robots think like humans?",
            "How do robots see things?",
            "What's inside a robot?",
            "How do robot vacuums know where to go?",
            "Can robots have feelings?",
            "How do robot toys work?",
            "What jobs do robots do?",
            "How are robots taught new things?",
            "What will robots be like in the future?"
        ]
    },
    
    // Animals & Nature
    animals: {
        displayName: "Animals",
        emoji: "🦊",
        questions: [
            "How do animals communicate?",
            "Why do cats purr?",
            "How smart are dolphins?",
            "Why do snakes shed their skin?",
            "How do birds know where to migrate?",
            "Why do dogs wag their tails?",
            "How do chameleons change color?",
            "Do animals have feelings?",
            "How do bees make honey?",
            "Why do some animals glow in the dark?"
        ]
    },
    cats: {
        displayName: "Cats",
        emoji: "🐱",
        questions: [
            "Why do cats purr?",
            "How do cats always land on their feet?",
            "Why do cats knead with their paws?",
            "How far can cats jump?",
            "Why do cats have whiskers?",
            "How many hours do cats sleep each day?",
            "Can cats see in complete darkness?",
            "Why do cats' eyes glow in the dark?",
            "How fast can cats run?",
            "Do cats sweat?"
        ]
    },
    dogs: {
        displayName: "Dogs",
        emoji: "🐶",
        questions: [
            "Why do dogs wag their tails?",
            "How do dogs smell so well?",
            "Why do dogs chase their tails?",
            "How do dogs communicate?",
            "Why do dogs like bones?",
            "Can dogs see colors?",
            "Why do dogs howl?",
            "How smart are dogs?",
            "Why do dogs pant?",
            "How do police dogs find things?"
        ]
    },
    dinosaurs: {
        displayName: "Dinosaurs",
        emoji: "🦕",
        questions: [
            "What was the biggest dinosaur?",
            "Why did dinosaurs go extinct?",
            "How do we know what dinosaurs looked like?",
            "Were dinosaurs smart?",
            "Could T-Rex really not see you if you didn't move?",
            "How do scientists find dinosaur bones?",
            "Did all dinosaurs lay eggs?",
            "Were there dinosaurs with feathers?",
            "How long did dinosaurs live?",
            "What dinosaurs could fly?"
        ]
    },
    reptiles: {
        displayName: "Reptiles",
        emoji: "🐍",
        questions: [
            "Why do snakes shed their skin?",
            "How do chameleons change color?",
            "Why don't reptiles get cold?",
            "How long can turtles live?",
            "Why do lizards lose their tails?",
            "How do crocodiles breathe underwater?",
            "Do snakes have ears?",
            "Why do some lizards have frills?",
            "How do reptiles have babies?",
            "Are reptiles related to dinosaurs?"
        ]
    },
    ocean: {
        displayName: "Ocean Life",
        emoji: "🐙",
        questions: [
            "How deep is the ocean?",
            "What's the biggest creature in the ocean?",
            "How do fish breathe underwater?",
            "Why are coral reefs important?",
            "How do octopuses change color?",
            "Why is the ocean salty?",
            "How do whales communicate?",
            "Can sharks really smell a drop of blood from far away?",
            "How do sea turtles find their way home?",
            "What glows in the deep ocean?"
        ]
    },
    insects: {
        displayName: "Insects",
        emoji: "🐝",
        questions: [
            "How do ants work together?",
            "Why do fireflies glow?",
            "How many eyes do spiders have?",
            "Why do crickets chirp?",
            "How do bees make honey?",
            "Can bugs feel pain?",
            "How strong are ants?",
            "Why do butterflies have colorful wings?",
            "How do spiders make webs?",
            "Why don't bugs die when they fall?"
        ]
    },
    plants: {
        displayName: "Plants",
        emoji: "🌱",
        questions: [
            "How do plants grow?",
            "Why do leaves change color?",
            "How do plants know which way is up?",
            "Can plants communicate with each other?",
            "How do seeds know when to sprout?",
            "Why do plants need sunlight?",
            "How do trees live so long?",
            "Why do some plants eat insects?",
            "How do cacti survive in the desert?",
            "Why do flowers smell nice?"
        ]
    },
    
    // Culture & History
    history: {
        displayName: "Cool History",
        emoji: "🏛️",
        questions: [
            "Who invented video games?",
            "What was the weirdest fashion trend in history?",
            "When was the first computer invented?",
            "Who were the Vikings?",
            "What was the most surprising ancient technology?",
            "Were there female pirates?",
            "What did ancient Egyptian kids play with?",
            "Who invented pizza?",
            "What was school like 100 years ago?",
            "What's the oldest city in the world?"
        ]
    },
    weird: {
        displayName: "Weird Facts",
        emoji: "🤯",
        questions: [
            "Why do we have fingerprints?",
            "Can trees communicate with each other?",
            "Why do some people have different colored eyes?",
            "Are there animals that can live forever?",
            "Why does time seem to go faster as you get older?",
            "How do optical illusions trick our brains?",
            "Do other animals dream like humans do?",
            "Why can't we tickle ourselves?",
            "Why do we get brain freeze when eating cold things?",
            "Can plants feel pain?"
        ]
    },
    mythology: {
        displayName: "Mythology",
        emoji: "🧙‍♂️",
        questions: [
            "Who were the Greek gods?",
            "Why did people believe in dragons?",
            "What are the coolest mythical creatures?",
            "What powers did Thor have?",
            "What's the story of Atlantis?",
            "Are mermaids in stories around the world?",
            "What did ancient people think caused lightning?",
            "Who were the Egyptian gods?",
            "What's the story of King Arthur?",
            "Why did people make up myths?"
        ]
    },
    art: {
        displayName: "Art",
        emoji: "🎨",
        questions: [
            "How do artists mix colors?",
            "What's the most famous painting in the world?",
            "Why is the Mona Lisa so special?",
            "How do sculptors make statues?",
            "What is abstract art?",
            "How do cartoonists create characters?",
            "What is street art?",
            "Why do museums have art?",
            "How do people make animations?",
            "What art did cave people make?"
        ]
    },
    music: {
        displayName: "Music",
        emoji: "🎵",
        questions: [
            "How do instruments make different sounds?",
            "Why does music make us feel emotions?",
            "How do singers hit high notes?",
            "What makes a catchy song?",
            "How does an orchestra work together?",
            "What's inside a piano?",
            "How are songs recorded?",
            "Why do some voices sound good together?",
            "How do composers create music?",
            "Why do we like some songs but not others?"
        ]
    },
    sports: {
        displayName: "Sports",
        emoji: "⚽",
        questions: [
            "How fast can humans run?",
            "Why do balls bounce?",
            "How do swimmers move so fast?",
            "What makes a good skateboard trick?",
            "How do gymnasts flip without getting dizzy?",
            "Why are sports balls different shapes?",
            "How do athletes train?",
            "What makes someone good at sports?",
            "How do rock climbers not fall?",
            "Why do some countries love certain sports?"
        ]
    },
    
    // Tech & Gaming
    videogames: {
        displayName: "Video Games",
        emoji: "🎮",
        questions: [
            "How are video games made?",
            "What makes games fun?",
            "How do game characters move?",
            "Why do games have levels?",
            "How do multiplayer games work?",
            "What was the first video game?",
            "How do VR games work?",
            "Why do some games have glitches?",
            "How do game designers create worlds?",
            "What jobs are there in making games?"
        ]
    },
    internet: {
        displayName: "Internet",
        emoji: "🌐",
        questions: [
            "How does the internet work?",
            "How do websites know who I am?",
            "What happens when I click a link?",
            "How does WiFi work?",
            "Why do websites have ads?",
            "How is the internet connected around the world?",
            "What is the cloud?",
            "How do videos stream without stopping?",
            "How are websites made?",
            "Why do some websites load faster than others?"
        ]
    },
    minecraft: {
        displayName: "Minecraft",
        emoji: "⛏️",
        questions: [
            "How big can a Minecraft world get?",
            "Why do Endermen hate being looked at?",
            "How are Minecraft biomes designed?",
            "What's the rarest thing in Minecraft?",
            "How does redstone work?",
            "Why do Creepers explode?",
            "How many blocks are in Minecraft?",
            "What are the most useful Minecraft tricks?",
            "How do Minecraft mods work?",
            "What was Minecraft like when it first came out?"
        ]
    },
    gadgets: {
        displayName: "Gadgets",
        emoji: "📱",
        questions: [
            "How do touchscreens know where your finger is?",
            "What's inside a smartphone?",
            "How do headphones work?",
            "What makes gadgets get faster every year?",
            "How do smartwatches track steps?",
            "What powers drones?",
            "How do cameras take pictures?",
            "What makes some gadgets waterproof?",
            "How do video game controllers work?",
            "What will gadgets be like in the future?"
        ]
    },
    
    // Science & Experiments
    experiments: {
        displayName: "Experiments",
        emoji: "🔬",
        questions: [
            "What's a cool science experiment I can do at home?",
            "How do I make a volcano with baking soda?",
            "How can I make slime?",
            "What experiments show static electricity?",
            "How can I grow crystals?",
            "What's a fun experiment with magnets?",
            "How can I make a rainbow with water?",
            "What experiments show air pressure?",
            "How can I make invisible ink?",
            "What's a safe chemistry experiment for kids?"
        ]
    },
    brain: {
        displayName: "Brain & Mind",
        emoji: "🧠",
        questions: [
            "Why do we forget things?",
            "How do we learn new skills?",
            "Why do we dream?",
            "How does memory work?",
            "Why do we get bored?",
            "How does the brain control the body?",
            "Why do optical illusions trick us?",
            "How do we recognize faces?",
            "Why do we feel emotions?",
            "How does the brain grow?"
        ]
    },
    
    // Miscellaneous
    food: {
        displayName: "Food Science",
        emoji: "🍕",
        questions: [
            "Why does popcorn pop?",
            "How is ice cream made?",
            "Why does toast change color?",
            "How do they make candy so colorful?",
            "Why does food go bad?",
            "How do they make spicy foods?",
            "What makes soda fizzy?",
            "How do they make gummy candies?",
            "Why do onions make you cry?",
            "How do they put bubbles in chocolate?"
        ]
    },
    colors: {
        displayName: "Colors",
        emoji: "🌈",
        questions: [
            "Why is the sky blue?",
            "How do rainbows form?",
            "What makes things glow in the dark?",
            "Why do leaves change color in fall?",
            "How do chameleons change color?",
            "What makes flamingos pink?",
            "Why are sunsets red and orange?",
            "How do colors mix to make new ones?",
            "Why do some things look different colors to different people?",
            "How do screens show so many colors?"
        ]
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined') {
    module.exports = { TOPIC_QUESTIONS };
}