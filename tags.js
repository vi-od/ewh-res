// All available tags organized and sorted
const allTags = [
    "3", "3d", "african", "ahegao", "amazing", "anal creampie", "anal fingering", "anal fisting", "anal gape", "anal orgasm", "anal threesome", "anime", "army", "ass to mouth",
    "babe", "bald pussy", "ball gag", "ball licking", "ball sucking", "bathroom", "bbw milf", "bbw solo", "beach", "behind the scenes", "big black dick", "big breasts", "big butts", "big clit", "big cock", "big natural tits", "bikini", "black", "black bbw", "black granny", "black lesbians", "black pussy", "black teen", "blindfold", "boss", "bra", "bride", "british", "bubble butt", "bukkake", "bunny", "busty", "butt plug",
    "christmas", "chubby", "chubby amateur", "clit rubbing", "coed", "college", "condom", "corset", "costume", "couple", "cougar", "cum in mouth", "cum in pussy", "cum inside", "cum kiss", "cum on asshole", "cum on body", "cum on stomach", "cum on tits", "cum swap", "cum swallow", "cunnilingus", "curly hair", "czech", "czech casting",
    "debt", "defloration", "dick riding", "dildo riding", "dirty talk", "disney", "double anal",
    "emo", "erotic", "european", "ex girlfriend", "exchange student", "exhibition", "extreme", "eye rolling",
    "facefuck", "fake tits", "fat", "fat ass", "fetish", "ffm", "first time anal", "first time sex", "fishnet", "fitness", "fnaf", "fortnite", "foursome", "fox", "french", "funny", "furry", "futurama",
    "gagged", "gagging", "gaping", "german milf", "gilf", "girl", "girl on girl", "girl scout", "glasses", "glamour", "grandpa", "gym",
    "halloween", "hentai", "high heels", "hijab", "hinata", "horny", "hospital", "hottie", "housekeeper", "huge cum load", "huge tits", "hymen",
    "inked", "innocent", "innocent girl", "iranian", "italian",
    "japanese uncensored", "jav uncensored", "jeans", "jerk off", "jiggly ass", "jiggly tits",
    "kink", "kissing", "kitchen",
    "latex", "leggings", "lesbain", "lesbian anal fisting", "lesbian bukkake", "lesbian orgy", "lesbian seduction", "lesbian strapon", "love",
    "masseur", "mature small tits", "mermaid", "mexican milf", "milf pov", "missionary", "mistress", "mmf", "mom handjob", "money", "monster", "mother in law", "muslim",
    "nanny", "naruto", "natural tits", "naughty girl", "neighbor", "nezuko", "nice ass", "nice tits", "nude milf", "nurse", "nylon",
    "old", "old lady", "old man", "oral creampie", "oral sex", "outdoor", "outside", "overwatch",
    "pantyhose", "parody", "party", "patient", "pee", "penthouse", "perfect", "perfect tits", "perky tits", "petite", "pick up", "pierced pussy", "pierced tits", "piercing", "pigtails", "pissing", "plumber", "police", "polish", "pool", "porn for women", "porn sex", "pounding", "pov blowjob", "preggo", "primal", "primal fetish", "prostitute", "puffy nipples", "purple hair", "pussy", "pussy fuck", "pussy licking", "pussy rubbing",
    "reality", "real sex", "reverse cowgirl", "riding cock", "ripped jeans", "role play", "romanian", "romantic", "roommate", "rough sex", "round butt", "round tits",
    "saggy tits", "santa", "scissoring", "scooby doo", "secretary", "seduction", "sex for money", "sex toys", "sexwife", "sexy", "shower", "side fuck", "silicone tits", "sims", "slut", "small", "small tits milf", "smoking", "smoking fetish", "sons friend", "spanking", "spanish", "squirt in mouth", "sri lankan", "step sibling", "stepbro", "stepdad", "stepsis", "stepson", "street", "striptease", "stuck", "student", "submissive", "sucking cock", "super skinny", "swimsuit",
    "tail plug", "tan", "taxi", "teacher student", "teasing", "teen anal", "tennis", "threesome", "throbbing cock", "throbbing creampie", "throbbing pussy", "throatfuck", "throatpie", "tight asshole", "tight jeans", "tight pussy", "tiny", "tiny tits", "titfuck", "tits", "tribbing", "trimmed pussy", "turkish", "twerk", "two girls",
    "ukrainian", "uncle", "underwear", "uniform",
    "virgin",
    "wedding", "wet panties", "wet pussy", "whipped ass", "white pornstars", "white stockings", "whore", "wife anal", "wife blowjob", "wife swap", "workout", "wrong hole",
    "yoga", "young", "youtube"
];

// Organize tags by first letter
const tagsByLetter = {};
let currentLetterFilter = 'all';
let searchQuery = '';

// DOM elements
const tagsGrid = document.getElementById('tagsGrid');
const tagSearch = document.getElementById('tagSearch');
const alphabetBtns = document.querySelectorAll('.alphabet-btn');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    organizeTags();
    renderTags();
    setupEventListeners();
});

// Organize tags alphabetically
function organizeTags() {
    // Clear existing organization
    for (let letter = 'A'; letter <= 'Z'; letter++) {
        tagsByLetter[letter] = [];
    }
    tagsByLetter['0-9'] = [];
    
    // Sort all tags alphabetically first
    const sortedTags = [...allTags].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    // Group by first letter
    sortedTags.forEach(tag => {
        const firstChar = tag.charAt(0).toUpperCase();
        
        if (firstChar >= 'A' && firstChar <= 'Z') {
            if (!tagsByLetter[firstChar]) {
                tagsByLetter[firstChar] = [];
            }
            tagsByLetter[firstChar].push(tag);
        } else if (firstChar >= '0' && firstChar <= '9') {
            if (!tagsByLetter['0-9']) {
                tagsByLetter['0-9'] = [];
            }
            tagsByLetter['0-9'].push(tag);
        } else {
            // Handle special characters by putting them in 0-9 section
            if (!tagsByLetter['0-9']) {
                tagsByLetter['0-9'] = [];
            }
            tagsByLetter['0-9'].push(tag);
        }
    });
}

// Render tags based on current filter
function renderTags() {
    const filteredTags = getFilteredTags();
    tagsGrid.innerHTML = '';
    
    if (searchQuery) {
        // Show search results
        renderSearchResults(filteredTags);
    } else if (currentLetterFilter === 'all') {
        // Show all tags organized by letter
        renderAllTags();
    } else {
        // Show tags for specific letter
        renderLetterTags(currentLetterFilter, filteredTags);
    }
}

// Get filtered tags based on current filters
function getFilteredTags() {
    let tags = [];
    
    if (currentLetterFilter === 'all') {
        tags = allTags;
    } else {
        tags = tagsByLetter[currentLetterFilter] || [];
    }
    
    if (searchQuery) {
        tags = tags.filter(tag => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    return tags;
}

// Render search results
function renderSearchResults(tags) {
    const searchInfo = document.createElement('div');
    searchInfo.className = 'search-info';
    searchInfo.textContent = `Found ${tags.length} tags matching "${searchQuery}"`;
    tagsGrid.appendChild(searchInfo);
    
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'tags-grid';
    
    tags.forEach((tag, index) => {
        const tagCard = createTagCard(tag, index);
        resultsGrid.appendChild(tagCard);
    });
    
    tagsGrid.appendChild(resultsGrid);
}

// Render all tags organized by letter
function renderAllTags() {
    const letters = ['0-9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    
    letters.forEach(letter => {
        const tags = tagsByLetter[letter];
        if (tags && tags.length > 0) {
            renderLetterSection(letter, tags);
        }
    });
}

// Render tags for a specific letter
function renderLetterTags(letter, tags) {
    if (tags.length > 0) {
        renderLetterSection(letter, tags);
    } else {
        const noResults = document.createElement('div');
        noResults.className = 'search-info';
        noResults.textContent = `No tags found for letter "${letter}"`;
        tagsGrid.appendChild(noResults);
    }
}

// Render a letter section
function renderLetterSection(letter, tags) {
    const section = document.createElement('div');
    section.className = 'letter-section';
    
    const header = document.createElement('div');
    header.className = 'letter-header';
    header.textContent = letter === '0-9' ? 'Numbers & Symbols' : letter;
    section.appendChild(header);
    
    const grid = document.createElement('div');
    grid.className = 'tags-grid';
    
    tags.forEach((tag, index) => {
        const tagCard = createTagCard(tag, index);
        grid.appendChild(tagCard);
    });
    
    section.appendChild(grid);
    tagsGrid.appendChild(section);
}

// Create a tag card element
function createTagCard(tag, index) {
    const card = document.createElement('div');
    card.className = 'tag-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Mark popular tags (you can customize this logic)
    const popularTags = ['anal', 'big tits', 'milf', 'teen', 'blonde', 'pussy', 'ass', 'cum'];
    if (popularTags.some(popular => tag.toLowerCase().includes(popular.toLowerCase()))) {
        card.classList.add('popular');
    }
    
    const tagName = document.createElement('div');
    tagName.className = 'tag-name';
    tagName.textContent = tag;
    
    const tagCount = document.createElement('div');
    tagCount.className = 'tag-count';
    tagCount.innerHTML = `<i class="fas fa-images"></i> ${getRandomCount()} images`;
    
    card.appendChild(tagName);
    card.appendChild(tagCount);
    
    // Add click handler to navigate to gallery with this tag
    card.addEventListener('click', () => {
        // Store the selected tag and navigate to gallery
        localStorage.setItem('selectedTag', tag);
        window.location.href = 'index.html?tag=' + encodeURIComponent(tag);
    });
    
    return card;
}

// Generate random count for demonstration
function getRandomCount() {
    return Math.floor(Math.random() * 500) + 10;
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    tagSearch.addEventListener('input', function() {
        searchQuery = this.value;
        renderTags();
    });
    
    // Alphabet filtering
    alphabetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alphabetBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentLetterFilter = this.dataset.letter;
            searchQuery = ''; // Clear search when changing letter
            tagSearch.value = '';
            renderTags();
        });
    });
    
    // Check if we came from a tag selection
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTag = urlParams.get('tag');
    if (selectedTag) {
        // Highlight the selected tag
        setTimeout(() => {
            const tagCards = document.querySelectorAll('.tag-card');
            tagCards.forEach(card => {
                if (card.querySelector('.tag-name').textContent === selectedTag) {
                    card.style.border = '2px solid var(--primary-color)';
                    card.style.boxShadow = 'var(--glow)';
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }, 500);
    }
}

// Add smooth scrolling for better UX
function scrollToLetter(letter) {
    const letterSection = document.querySelector(`[data-letter="${letter}"]`);
    if (letterSection) {
        letterSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        searchQuery = '';
        tagSearch.value = '';
        renderTags();
    }
    
    // Arrow key navigation through alphabet
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const currentIndex = Array.from(alphabetBtns).findIndex(btn => btn.classList.contains('active'));
        let newIndex;
        
        if (e.key === 'ArrowLeft') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : alphabetBtns.length - 1;
        } else {
            newIndex = currentIndex < alphabetBtns.length - 1 ? currentIndex + 1 : 0;
        }
        
        alphabetBtns[newIndex].click();
    }
}); 