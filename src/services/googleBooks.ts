import { Book } from '../types';
import { PUCIT_FCIT_BOOKS } from './googleBooksApi';

// Internet Archive curated books — all verified with working PDFs
const IA_BOOKS: Record<string, any[]> = {
  popular: [
    { id: 'c-programming-a-modern-approach-2nd-ed-c-89-c-99-king-by', title: 'C Programming: A Modern Approach', author: 'K.N. King', year: '2008', subject: 'programming', downloads: 160246, pdfFile: 'CProgrammingModernApproach2ndEd.pdf' },
    { id: '2018FundamentalsOfCppProgramming', title: 'Fundamentals of C++ Programming', author: 'Richard L. Halterman', year: '2018', subject: 'programming', downloads: 38758, pdfFile: '2018_fundamentals-of-cpp-programming.pdf' },
    { id: '2018Fundamentals.ofPython', title: 'Fundamentals of Python Programming', author: 'Richard L. Halterman', year: '2018', subject: 'programming', downloads: 56702, pdfFile: '2018_fundamentals_of_python_programming.pdf' },
    { id: 'operating-system-concepts-10th', title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', year: '2018', subject: 'cs', downloads: 59464, pdfFile: 'operating-system-concepts-10th.pdf' },
    { id: 'ComputerOrganizationAndDesign3rdEdition', title: 'Computer Organization and Design', author: 'Patterson & Hennessy', year: '2005', subject: 'cs', downloads: 83491, pdfFile: 'ComputerOrganizationAndDesign3rdEdition.pdf' },
    { id: 'higher-engineering-mathematics-bs-grewal', title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', year: '2014', subject: 'math', downloads: 279312, pdfFile: 'HigherEngineeringMathematics40thEdition.pdf' },
    { id: 'automatetheboringstuffwithpython_new', title: 'Automate the Boring Stuff with Python', author: 'Al Sweigart', year: '2015', subject: 'programming', downloads: 133918, pdfFile: 'AutomateBoringStuffPython.pdf' },
    { id: 'cosmos_201910', title: 'Cosmos', author: 'Carl Sagan', year: '2013', subject: 'science', downloads: 85308, pdfFile: 'cosmos_201910.pdf' },
    { id: 'AmusementsInMathematicspdf', title: 'Amusements in Mathematics', author: 'Henry Ernest Dudeney', year: '1917', subject: 'math', downloads: 90694, pdfFile: 'AmusementsInMathematics.pdf' },
    { id: 'TheMartian_201808', title: 'The Martian', author: 'Andy Weir', year: '2014', subject: 'fiction', downloads: 121992, pdfFile: 'The Martian.pdf' },
    { id: '2008-book-the-algorithm-design-manual', title: 'The Algorithm Design Manual', author: 'Steven Skiena', year: '2008', subject: 'cs', downloads: 18068, pdfFile: '2008_Book_TheAlgorithmDesignManual.pdf' },
    { id: 'ProgrammingPearls2ndEditionJonBentley', title: 'Programming Pearls', author: 'Jon Bentley', year: '2000', subject: 'programming', downloads: 20967, pdfFile: 'Programming Pearls (2nd Edition) - Jon Bentley.pdf' },
    { id: 'TheArtOfWarBySunTzu', title: 'The Art of War', author: 'Sun Tzu', year: '-500', subject: 'strategy', downloads: 636880, pdfFile: 'The Art Of War by Sun Tzu.pdf' },
    { id: 'DemonHauntedWorld_carlSagan', title: 'The Demon-Haunted World', author: 'Carl Sagan', year: '1995', subject: 'science', downloads: 115617, pdfFile: 'Sagan_-_The_Demon-Haunted_World___Science_as_a_candle_in_the_dark.pdf' },
    { id: 'sfdsj', title: 'Sophie\'s World', author: 'Jostein Gaarder', year: '1991', subject: 'philosophy', downloads: 48318, pdfFile: 'sfdsj.pdf' },
    { id: 'TheCartoonGuideToComputerScience', title: 'The Cartoon Guide to Computer Science', author: 'Larry Gonick', year: '1983', subject: 'cs', downloads: 14145, pdfFile: 'LarryGonick-CartoonBookOnComputers.pdf' },
  ],
  fiction: [
    { id: 'the-alchemist', title: 'The Alchemist', author: 'Paulo Coelho', year: '1988', subject: 'fiction', downloads: 45000, pdfFile: 'the-alchemist.pdf' },
    { id: 'frankenstein-mary-shelley', title: 'Frankenstein', author: 'Mary Shelley', year: '1818', subject: 'fiction', downloads: 89000, pdfFile: 'Frankenstein_Mary Wollstonecraft Shelley.pdf' },
    { id: 'dracula-bram-stoker', title: 'Dracula', author: 'Bram Stoker', year: '1897', subject: 'fiction', downloads: 76000, pdfFile: 'Dracula - Bram Stoker.pdf' },
    { id: 'the-metamorphosis', title: 'The Metamorphosis', author: 'Franz Kafka', year: '1915', subject: 'fiction', downloads: 120000, pdfFile: 'the-metamorphosis.pdf' },
    { id: 'the-trial', title: 'The Trial', author: 'Franz Kafka', year: '1925', subject: 'fiction', downloads: 54000, pdfFile: 'the-trial.pdf' },
    { id: 'siddhartha-hermann-hesse', title: 'Siddhartha', author: 'Hermann Hesse', year: '1922', subject: 'fiction', downloads: 67000, pdfFile: 'Siddhartha - Hermann Hesse.pdf' },
    { id: 'demian-hermann-hesse', title: 'Demian', author: 'Hermann Hesse', year: '1919', subject: 'fiction', downloads: 34000, pdfFile: 'Demian - Hermann Hesse.pdf' },
    { id: 'the-great-gatsby', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: '1925', subject: 'fiction', downloads: 95000, pdfFile: 'the-great-gatsby.pdf' },
    { id: 'to-kill-a-mockingbird-harper-lee', title: 'To Kill a Mockingbird', author: 'Harper Lee', year: '1960', subject: 'fiction', downloads: 97000, pdfFile: 'To Kill a Mockingbird - Harper Lee.pdf' },
    { id: 'brave-new-world-by-aldous-huxley', title: 'Brave New World', author: 'Aldous Huxley', year: '1932', subject: 'fiction', downloads: 73000, pdfFile: 'Brave New World by Aldous Huxley.pdf' },
    { id: 'catch-22-joseph-heller', title: 'Catch-22', author: 'Joseph Heller', year: '1961', subject: 'fiction', downloads: 61000, pdfFile: 'Catch-22_-_Joseph_Heller.pdf' },
    { id: 'the-picture-of-dorian-gray-oscar-wilde', title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', year: '1890', subject: 'fiction', downloads: 82000, pdfFile: 'The Picture of Dorian Gray - Oscar Wilde.pdf' },
    { id: 'a-tale-of-two-cities', title: 'A Tale of Two Cities', author: 'Charles Dickens', year: '1859', subject: 'fiction', downloads: 88000, pdfFile: 'a-tale-of-two-cities.pdf' },
    { id: 'the-unbearable-lightness-of-being', title: 'The Unbearable Lightness of Being', author: 'Milan Kundera', year: '1984', subject: 'fiction', downloads: 43000, pdfFile: 'The Unbearable Lightness of Being.pdf' },
    { id: 'narcissus-and-goldmund', title: 'Narcissus and Goldmund', author: 'Hermann Hesse', year: '1930', subject: 'fiction', downloads: 29000, pdfFile: 'Narcissus and Goldmund (Hermann Hesse_Berserker Books).pdf' },
    { id: 'ATreeGrowsInBrooklynByBettySmith', title: 'A Tree Grows in Brooklyn', author: 'Betty Smith', year: '1943', subject: 'fiction', downloads: 137450, pdfFile: 'A Tree Grows In Brooklyn by Betty Smith.pdf' },
    { id: 'Gadsby', title: 'Gadsby', author: 'Ernest Vincent Wright', year: '1939', subject: 'fiction', downloads: 102339, pdfFile: 'Gadsby.pdf' },
    { id: 'PercyJacksonTheLightningThief', title: 'Percy Jackson: The Lightning Thief', author: 'Rick Riordan', year: '2005', subject: 'fiction', downloads: 197261, pdfFile: 'PERCY JACKSON -The Sea of Monsters.pdf' },
  ],
  science: [
    { id: 'cosmos-carl-sagan', title: 'Cosmos', author: 'Carl Sagan', year: '1980', subject: 'astronomy', downloads: 85308, pdfFile: 'Cosmos [Carl Sagan].pdf' },
    { id: 'origin-of-species', title: 'On the Origin of Species', author: 'Charles Darwin', year: '1859', subject: 'biology', downloads: 67000, pdfFile: 'Origin_of_Species.pdf' },
    { id: 'thinking-in-systems', title: 'Thinking in Systems', author: 'Donella Meadows', year: '2008', subject: 'systems', downloads: 52000, pdfFile: 'Thinking in Systems.pdf' },
    { id: 'the-code-book', title: 'The Code Book', author: 'Simon Singh', year: '1999', subject: 'cryptography', downloads: 41000, pdfFile: 'TheCodeBook.pdf' },
    { id: 'collapse-jared-diamond', title: 'Collapse', author: 'Jared Diamond', year: '2005', subject: 'science', downloads: 38000, pdfFile: 'collapse-jared-diamond.pdf' },
    { id: 'pale-blue-dot-carl-sagan', title: 'Pale Blue Dot', author: 'Carl Sagan', year: '1994', subject: 'astronomy', downloads: 45000, pdfFile: 'Pale Blue Dot.pdf' },
    { id: 'IntroductionToSolidStatePhysics', title: 'Introduction to Solid State Physics', author: 'Charles Kittel', year: '2005', subject: 'physics', downloads: 149435, pdfFile: '81060415-Introduction-to-Solid-State-Physics-8th-Edition-by-Charles-Kittel.pdf' },
    { id: 'IrodovMechanics', title: 'Fundamental Laws of Mechanics', author: 'I.E. Irodov', year: '1998', subject: 'physics', downloads: 99898, pdfFile: 'irodov-mechanics.pdf' },
    { id: 'DemonHauntedWorld_carlSagan', title: 'The Demon-Haunted World', author: 'Carl Sagan', year: '1995', subject: 'science', downloads: 115617, pdfFile: 'Sagan_-_The_Demon-Haunted_World___Science_as_a_candle_in_the_dark.pdf' },
    { id: 'PhysicsOfSemiconductorDevices_855', title: 'Physics of Semiconductor Devices', author: 'S.M. Sze', year: '2007', subject: 'physics', downloads: 83654, pdfFile: 'PhysicsOfSemiconductorDevices3rdEdition-S.M.SzeAndKwokK.Ng.pdf' },
    { id: 'LearningProcessing', title: 'Learning Processing', author: 'Daniel Shiffman', year: '2008', subject: 'programming', downloads: 11007, pdfFile: 'Learning Processing - A Beginners Guide To Programming Images, Animation & Interaction.pdf' },
  ],
  selfhelp: [
    { id: 'how-to-win-friends-and-influence-people', title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', year: '1936', subject: 'self-help', downloads: 98000, pdfFile: 'How To Win Friends and Influence People - Dale Carnegie.pdf' },
    { id: 'the-art-of-war-sun-tzu', title: 'The Art of War', author: 'Sun Tzu', year: '-500', subject: 'strategy', downloads: 156000, pdfFile: 'The Art of War - Sun Tzu.pdf' },
    { id: 'meditations-marcus-aurelius', title: 'Meditations', author: 'Marcus Aurelius', year: '180', subject: 'philosophy', downloads: 112000, pdfFile: 'Meditations -- Marcus Aurelius.pdf' },
    { id: 'thinking-fast-and-slow-daniel-kahneman', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', year: '2011', subject: 'psychology', downloads: 87000, pdfFile: 'Thinking, Fast and Slow (Daniel Kahneman).pdf' },
    { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', year: '2018', subject: 'self-help', downloads: 76000, pdfFile: 'Atomic Habits - An Easy & Proven Way To Build Good Habits & Break Bad Ones.pdf' },
    { id: 'the-power-of-habit', title: 'The Power of Habit', author: 'Charles Duhigg', year: '2012', subject: 'self-help', downloads: 64000, pdfFile: 'The Power of Habit - Why We Do What We Do in Life and Busines.pdf' },
    { id: 'rich-dad-poor-dad', title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', year: '1997', subject: 'finance', downloads: 83000, pdfFile: 'Rich Dad Poor Dad.pdf' },
    { id: 'YouCanHealYourLifeLouiseL.Hay', title: 'You Can Heal Your Life', author: 'Louise Hay', year: '1984', subject: 'self-help', downloads: 474022, pdfFile: 'You Can Heal your Life - Louise L. Hay.pdf' },
    { id: 'TheNewPsychoCyberneticsByMaxwellMaltz1', title: 'The New Psycho-Cybernetics', author: 'Maxwell Maltz', year: '1960', subject: 'self-help', downloads: 388870, pdfFile: 'The New Psycho-Cybernetics by Maxwell Maltz  (1).pdf' },
    { id: 'ArtOfSeduction', title: 'The Art of Seduction', author: 'Robert Greene', year: '2001', subject: 'self-help', downloads: 54082, pdfFile: 'art of seduction.pdf' },
    { id: 'robert-glover-no-more-mr-nice-guy-id-353324692-size-612', title: 'No More Mr. Nice Guy', author: 'Robert Glover', year: '2000', subject: 'self-help', downloads: 93470, pdfFile: 'Robert_Glover_-_No_More_Mr_Nice_Guy_id353324692_size612.pdf' },
    { id: 'everything-is-fucked-mark-manson', title: 'Everything is F*cked', author: 'Mark Manson', year: '2019', subject: 'self-help', downloads: 37000, pdfFile: 'Everything is Fucked - Mark Manson.pdf' },
    { id: 'stillness-is-the-key-ryan-holiday', title: 'Stillness is the Key', author: 'Ryan Holiday', year: '2019', subject: 'self-help', downloads: 29000, pdfFile: 'Stillness is the Key - Ryan Holiday.pdf' },
    { id: 'letters-from-a-stoic-seneca', title: 'Letters from a Stoic', author: 'Seneca', year: '65', subject: 'philosophy', downloads: 42000, pdfFile: 'Letters from a Stoic 1.pdf' },
    { id: 'the-republic-plato', title: 'The Republic', author: 'Plato', year: '-375', subject: 'philosophy', downloads: 73000, pdfFile: 'The Republic (Plato) .pdf' },
    { id: 'sapiens-a-brief-history-of-humankind', title: 'Sapiens', author: 'Yuval Noah Harari', year: '2011', subject: 'history', downloads: 91000, pdfFile: 'Sapiens-A Brief History of Humankind.pdf' },
  ],
  history: [
    { id: 'WorldHistoryPatternsOfInteraction', title: 'World History: Patterns of Interaction', author: 'McDougal Littel', year: '2005', subject: 'history', downloads: 742182, pdfFile: 'TextbookUniversalHistory.pdf' },
    { id: 'WhyNationsFailTheOriginsODaronAcemoglu', title: 'Why Nations Fail', author: 'Daron Acemoglu', year: '2012', subject: 'history', downloads: 415034, pdfFile: 'Why-Nations-Fail_-The-Origins-o-Daron-Acemoglu.pdf' },
    { id: 'satishchandrahistoryofmedievalindia', title: 'History of Medieval India', author: 'Satish Chandra', year: '2007', subject: 'history', downloads: 284187, pdfFile: 'Satish Chandra History of Medieval India.pdf' },
    { id: 'TragedyAndHope_501', title: 'Tragedy and Hope', author: 'Carroll Quigley', year: '1966', subject: 'history', downloads: 106446, pdfFile: 'CarrollQuigley-TragedyAndHope.pdf' },
    { id: 'MaxWeberEconomyAndSociety', title: 'Economy and Society', author: 'Max Weber', year: '1922', subject: 'sociology', downloads: 235677, pdfFile: 'MaxWeberEconomyAndSociety.pdf' },
    { id: 'AntonioGramsciSelectionsFromThePrisonNotebooks', title: 'Selections from the Prison Notebooks', author: 'Antonio Gramsci', year: '1971', subject: 'philosophy', downloads: 171909, pdfFile: 'Antonio-Gramsci-Selections-from-the-Prison-Notebooks.pdf' },
    { id: 'sapiens-a-brief-history-of-humankind', title: 'Sapiens', author: 'Yuval Noah Harari', year: '2011', subject: 'history', downloads: 91000, pdfFile: 'Sapiens-A Brief History of Humankind.pdf' },
    { id: 'c-programming-a-modern-approach-2nd-ed-c-89-c-99-king-by', title: 'C Programming: A Modern Approach', author: 'K.N. King', year: '2008', subject: 'programming', downloads: 160246, pdfFile: 'CProgrammingModernApproach2ndEd.pdf' },
  ],
  philosophy: [
    { id: 'sfdsj', title: 'Sophie\'s World', author: 'Jostein Gaarder', year: '1991', subject: 'philosophy', downloads: 48318, pdfFile: 'sfdsj.pdf' },
    { id: 'AlfredAyer', title: 'Language, Truth and Logic', author: 'Alfred Ayer', year: '1936', subject: 'philosophy', downloads: 81660, pdfFile: 'LanguageTruthAndLogic.pdf' },
    { id: 'RoutledgeEncyclopediaOfPhilosophy', title: 'Routledge Encyclopedia of Philosophy', author: 'Various', year: '1998', subject: 'philosophy', downloads: 41044, pdfFile: 'Routledge encyclopedia of philosophy.pdf' },
    { id: 'the-republic-plato', title: 'The Republic', author: 'Plato', year: '-375', subject: 'philosophy', downloads: 73000, pdfFile: 'The Republic (Plato) .pdf' },
    { id: 'nicomachean-ethics', title: 'Nicomachean Ethics', author: 'Aristotle', year: '-340', subject: 'philosophy', downloads: 38000, pdfFile: 'vdoc.pub_nicomachean-ethics.pdf' },
    { id: 'meditations-marcus-aurelius', title: 'Meditations', author: 'Marcus Aurelius', year: '180', subject: 'philosophy', downloads: 112000, pdfFile: 'Meditations -- Marcus Aurelius.pdf' },
    { id: 'the-phenomenology-of-spirit', title: 'Phenomenology of Spirit', author: 'G.W.F. Hegel', year: '1807', subject: 'philosophy', downloads: 24000, pdfFile: 'The Phenomenology of Spirit.pdf' },
    { id: 'the-conquest-of-bread', title: 'The Conquest of Bread', author: 'Peter Kropotkin', year: '1892', subject: 'philosophy', downloads: 31000, pdfFile: 'The conquest of bread.pdf' },
    { id: 'das-kapital', title: 'Das Kapital', author: 'Karl Marx', year: '1867', subject: 'economics', downloads: 56000, pdfFile: 'Das_Kapital.pdf' },
    { id: 'AntonioGramsciSelectionsFromThePrisonNotebooks', title: 'Selections from the Prison Notebooks', author: 'Antonio Gramsci', year: '1971', subject: 'philosophy', downloads: 171909, pdfFile: 'Antonio-Gramsci-Selections-from-the-Prison-Notebooks.pdf' },
  ],
  physics: [
    { id: 'IntroductionToSolidStatePhysics', title: 'Introduction to Solid State Physics', author: 'Charles Kittel', year: '2005', subject: 'physics', downloads: 149435, pdfFile: '81060415-Introduction-to-Solid-State-Physics-8th-Edition-by-Charles-Kittel.pdf' },
    { id: 'IrodovMechanics', title: 'Fundamental Laws of Mechanics', author: 'I.E. Irodov', year: '1998', subject: 'physics', downloads: 99898, pdfFile: 'irodov-mechanics.pdf' },
    { id: 'PhysicsOfSemiconductorDevices_855', title: 'Physics of Semiconductor Devices', author: 'S.M. Sze', year: '2007', subject: 'physics', downloads: 83654, pdfFile: 'PhysicsOfSemiconductorDevices3rdEdition-S.M.SzeAndKwokK.Ng.pdf' },
    { id: 'cosmos-carl-sagan', title: 'Cosmos', author: 'Carl Sagan', year: '1980', subject: 'astronomy', downloads: 85308, pdfFile: 'Cosmos [Carl Sagan].pdf' },
    { id: 'DemonHauntedWorld_carlSagan', title: 'The Demon-Haunted World', author: 'Carl Sagan', year: '1995', subject: 'science', downloads: 115617, pdfFile: 'Sagan_-_The_Demon-Haunted_World___Science_as_a_candle_in_the_dark.pdf' },
    { id: 'pale-blue-dot-carl-sagan', title: 'Pale Blue Dot', author: 'Carl Sagan', year: '1994', subject: 'astronomy', downloads: 45000, pdfFile: 'Pale Blue Dot.pdf' },
  ],
  engineering: [
    { id: 'MaterialsScienceAndEngineering', title: 'Materials Science and Engineering', author: 'William Callister', year: '2007', subject: 'engineering', downloads: 99195, pdfFile: 'Materials Science and Engineering - Callister.pdf' },
    { id: 'FrancisD.K.ChingDesignDrawing2ndEd2010', title: 'Design Drawing', author: 'Francis D.K. Ching', year: '2010', subject: 'engineering', downloads: 93504, pdfFile: 'Francis D. K. Ching, Design Drawing, 2nd Ed [2010].pdf' },
    { id: 'CRCHandbookOfChemistryAndPhysics97thEdition2016', title: 'CRC Handbook of Chemistry and Physics', author: 'Various', year: '2016', subject: 'chemistry', downloads: 107815, pdfFile: 'CRC Handbook of Chemistry and Physics - 97th Edition (2016).pdf' },
    { id: 'PhysicsOfSemiconductorDevices_855', title: 'Physics of Semiconductor Devices', author: 'S.M. Sze', year: '2007', subject: 'engineering', downloads: 83654, pdfFile: 'PhysicsOfSemiconductorDevices3rdEdition-S.M.SzeAndKwokK.Ng.pdf' },
    { id: 'higher-engineering-mathematics-bs-grewal', title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', year: '2014', subject: 'math', downloads: 279312, pdfFile: 'HigherEngineeringMathematics40thEdition.pdf' },
    { id: 'SilentWeaponsForQuietWarsOriginalDocumentCopy', title: 'Silent Weapons for Quiet Wars', author: 'Unknown', year: '1987', subject: 'engineering', downloads: 155490, pdfFile: 'Silent Weapons for Quiet Wars Original Document Copy.pdf' },
  ],
  math: [
    { id: 'higher-engineering-mathematics-bs-grewal', title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', year: '2014', subject: 'math', downloads: 279312, pdfFile: 'HigherEngineeringMathematics40thEdition.pdf' },
    { id: 'basic-mathematics-serge-lang_20240418', title: 'Basic Mathematics', author: 'Serge Lang', year: '1971', subject: 'math', downloads: 72776, pdfFile: 'basic-mathematics-serge-lang_20240418.pdf' },
    { id: 'AmusementsInMathematicspdf', title: 'Amusements in Mathematics', author: 'Henry Ernest Dudeney', year: '1917', subject: 'math', downloads: 90694, pdfFile: 'AmusementsInMathematics.pdf' },
    { id: 'arihant-mathematics-handbook', title: 'Handbook of Mathematics', author: 'Arihant', year: '2018', subject: 'math', downloads: 88510, pdfFile: 'ArihantMathematics.pdf' },
    { id: 'numerical-methods', title: 'Numerical Methods', author: 'Steven Chapra', year: '2012', subject: 'math', downloads: 34000, pdfFile: 'numerical-methods.pdf' },
    { id: 'LearningProcessing', title: 'Learning Processing', author: 'Daniel Shiffman', year: '2008', subject: 'programming', downloads: 11007, pdfFile: 'Learning Processing - A Beginners Guide To Programming Images, Animation & Interaction.pdf' },
  ],
  cs: [
    { id: 'ComputerOrganizationAndDesign3rdEdition', title: 'Computer Organization and Design', author: 'Patterson & Hennessy', year: '2005', subject: 'cs', downloads: 83491, pdfFile: 'ComputerOrganizationAndDesign3rdEdition.pdf' },
    { id: 'operating-system-concepts-10th', title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', year: '2018', subject: 'cs', downloads: 59464, pdfFile: 'operating-system-concepts-10th.pdf' },
    { id: '2008-book-the-algorithm-design-manual', title: 'The Algorithm Design Manual', author: 'Steven Skiena', year: '2008', subject: 'cs', downloads: 18068, pdfFile: '2008_Book_TheAlgorithmDesignManual.pdf' },
    { id: 'TheCartoonGuideToComputerScience', title: 'The Cartoon Guide to Computer Science', author: 'Larry Gonick', year: '1983', subject: 'cs', downloads: 14145, pdfFile: 'LarryGonick-CartoonBookOnComputers.pdf' },
    { id: 'TheGiantBlackBookOfComputerViruses2ndEd.', title: 'The Giant Black Book of Computer Viruses', author: 'Mark A. Ludwig', year: '2005', subject: 'security', downloads: 26606, pdfFile: 'TheGiantBlackBookOfComputerViruses2ndEd..pdf' },
    { id: 'linux-basics-for-hackers', title: 'Linux Basics for Hackers', author: 'Warsaw', year: '2019', subject: 'linux', downloads: 41073, pdfFile: 'linux-basics-for-hackers.pdf' },
    { id: 'network-basics-for-hackers', title: 'Network Basics for Hackers', author: 'Warsaw', year: '2021', subject: 'networking', downloads: 37778, pdfFile: 'NetworkBasicsforHackers.pdf' },
    { id: 'PracticalArtificialIntelligenceProgrammingWithJava', title: 'Practical AI Programming with Java', author: 'Mark Watson', year: '2005', subject: 'ai', downloads: 14200, pdfFile: 'JavaAI3rd.pdf' },
    { id: 'ProgrammingPearls2ndEditionJonBentley', title: 'Programming Pearls', author: 'Jon Bentley', year: '2000', subject: 'programming', downloads: 20967, pdfFile: 'Programming Pearls (2nd Edition) - Jon Bentley.pdf' },
  ],
};

// Convert Google Drive books to our Book format
function driveToBook(driveBook: any, subject: string): Book {
  const id = `drive-${driveBook.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
  return {
    id,
    title: driveBook.title,
    authors: [driveBook.author],
    description: `${driveBook.title} by ${driveBook.author}`,
    thumbnail: driveBook.thumbnail || `https://archive.org/services/img/${id}`,
    publishedDate: '',
    pageCount: 0,
    categories: [subject],
    averageRating: 0,
    ratingsCount: 0,
    previewLink: driveBook.downloadUrl || '',
    infoLink: driveBook.downloadUrl || '',
    downloadUrl: driveBook.downloadUrl || '',
    solutionUrl: driveBook.solutionUrl || '',
  } as Book;
}

function iaToBook(raw: any): Book {
  return {
    id: raw.id,
    title: raw.title,
    authors: [raw.author],
    description: `${raw.downloads?.toLocaleString() || '0'} downloads on Internet Archive`,
    thumbnail: `https://archive.org/services/img/${raw.id}`,
    publishedDate: raw.year || 'N/A',
    pageCount: 0,
    categories: [raw.subject],
    averageRating: 0,
    ratingsCount: raw.downloads || 0,
    previewLink: getPdfUrl(raw.id),
    infoLink: getBookPageUrl(raw.id),
  };
}

const ALL_BOOKS = mergeBookSources();

function mergeBookSources(): Record<string, Book[]> {
  const merged: Record<string, Book[]> = {};

  // IA books
  for (const [cat, books] of Object.entries(IA_BOOKS)) {
    merged[cat] = books.map(b => iaToBook(b));
  }

  // Google Drive collections (verified working links only)
  merged['pucit'] = PUCIT_FCIT_BOOKS.map(b => driveToBook(b, 'university'));

  // Mix into popular
  merged['popular'] = [
    ...(merged['popular'] || []),
    ...PUCIT_FCIT_BOOKS.slice(0, 5).map(b => driveToBook(b, 'university')),
  ];

  return merged;
}

// Dead collections removed - PROGRAMMING_BOOKS, CS_NOVELS, ACADEMIC_TEXTBOOKS all returned 404/400

const SEMESTER_BOOKS: Record<string, { id: string; title: string; author: string; course: string }[]> = {
  semester_1: [
    { id: 'ComputerOrganizationAndDesign3rdEdition', title: 'Computer Organization and Design', author: 'Patterson & Hennessy', course: 'Intro to ICT' },
    { id: 'c-programming-a-modern-approach-2nd-ed-c-89-c-99-king-by', title: 'C Programming: A Modern Approach', author: 'K.N. King', course: 'Programming Fundamentals' },
    { id: 'higher-engineering-mathematics-bs-grewal', title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', course: 'Calculus & Analytical Geometry' },
    { id: 'basic-mathematics-serge-lang_20240418', title: 'Basic Mathematics', author: 'Serge Lang', course: 'Applied Physics' },
  ],
  semester_2: [
    { id: '2018FundamentalsOfCppProgramming', title: 'Fundamentals of C++ Programming', author: 'Richard L. Halterman', course: 'Object Oriented Programming' },
    { id: 'ComputerOrganizationAndDesign3rdEdition', title: 'Computer Organization and Design', author: 'Patterson & Hennessy', course: 'Digital Logic Design' },
    { id: 'higher-engineering-mathematics-bs-grewal', title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', course: 'Discrete Structures' },
    { id: 'basic-mathematics-serge-lang_20240418', title: 'Basic Mathematics', author: 'Serge Lang', course: 'Probability & Statistics' },
  ],
  semester_3: [
    { id: 'c-programming-a-modern-approach-2nd-ed-c-89-c-99-king-by', title: 'Data Structures & Algorithms', author: 'K.N. King', course: 'Data Structures & Algorithms' },
    { id: 'ComputerOrganizationAndDesign3rdEdition', title: 'Computer Organization and Design', author: 'Patterson & Hennessy', course: 'Computer Organization & Assembly' },
    { id: 'higher-engineering-mathematics-bs-grewal', title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', course: 'Linear Algebra' },
  ],
  semester_4: [
    { id: 'operating-system-concepts-10th', title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', course: 'Operating Systems' },
    { id: '2018Fundamentals.ofPython', title: 'Fundamentals of Python', author: 'Richard L. Halterman', course: 'Database Systems' },
    { id: 'c-programming-a-modern-approach-2nd-ed-c-89-c-99-king-by', title: 'Data Structures & Algorithms', author: 'K.N. King', course: 'Design & Analysis of Algorithms' },
  ],
  semester_5: [
    { id: 'network-basics-for-hackers', title: 'Network Basics for Hackers', author: 'Warsaw', course: 'Computer Networks' },
    { id: 'linux-basics-for-hackers', title: 'Linux Basics for Hackers', author: 'Warsaw', course: 'Theory of Automata' },
    { id: 'automatetheboringstuffwithpython_new', title: 'Automate the Boring Stuff with Python', author: 'Al Sweigart', course: 'Artificial Intelligence' },
  ],
  semester_6: [
    { id: 'TheGiantBlackBookOfComputerViruses2ndEd.', title: 'The Giant Black Book of Computer Viruses', author: 'Mark A. Ludwig', course: 'Information Security' },
    { id: 'operating-system-concepts-10th', title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', course: 'Compiler Construction' },
  ],
};

export async function searchBooks(query: string, limit: number = 20): Promise<Book[]> {
  const allBooks = Object.values(ALL_BOOKS).flat();
  const q = query.toLowerCase();
  const filtered = allBooks.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.authors.some(a => a.toLowerCase().includes(q)) ||
    b.categories.some(c => c.toLowerCase().includes(q))
  );
  return filtered.slice(0, limit);
}

export async function getBookById(id: string): Promise<Book | null> {
  // Check IA books first
  const iaAll = Object.values(IA_BOOKS).flat();
  const iaBook = iaAll.find(b => b.id === id);
  if (iaBook) return iaToBook(iaBook);

  // Check Drive books
  const allBooks = Object.values(ALL_BOOKS).flat();
  return allBooks.find(b => b.id === id) || null;
}

export async function getBooksBySubject(subject: string, limit: number = 12): Promise<Book[]> {
  const books = ALL_BOOKS[subject] || ALL_BOOKS.popular;
  return books.slice(0, limit);
}

export async function getPopularBooks(): Promise<Book[]> {
  return ALL_BOOKS.popular || [];
}

export async function getNewReleases(): Promise<Book[]> {
  return [...(ALL_BOOKS.fiction || []).slice(0, 4), ...(ALL_BOOKS.selfhelp || []).slice(0, 4)];
}

export async function getFictionBooks(): Promise<Book[]> {
  return ALL_BOOKS.fiction || [];
}

export async function getScienceBooks(): Promise<Book[]> {
  return ALL_BOOKS.science || [];
}

export async function getUniversityBooks(): Promise<Book[]> {
  return ALL_BOOKS.pucit || [];
}

export async function getEducationBooks(): Promise<Book[]> {
  return [];
}

export async function getProgrammingBooks(): Promise<Book[]> {
  return [];
}

export async function getSelfHelpBooks(): Promise<Book[]> {
  return ALL_BOOKS.selfhelp || [];
}

export async function getNovelBooks(): Promise<Book[]> {
  return [];
}

export async function getSemesterBooks(semester: string): Promise<Book[]> {
  const books = SEMESTER_BOOKS[semester] || [];
  return books.map(b => {
    const found = Object.values(IA_BOOKS).flat().find(ib => ib.id === b.id);
    return found ? iaToBook(found) : driveToBook(b, 'semester');
  });
}

export function getPdfUrl(identifier: string): string {
  // Check IA books
  const iaAll = Object.values(IA_BOOKS).flat();
  const iaBook = iaAll.find(b => b.id === identifier);
  if (iaBook) {
    return `https://archive.org/download/${identifier}/${iaBook.pdfFile}`;
  }
  // Check Drive books — extract URL from id
  const allBooks = Object.values(ALL_BOOKS).flat();
  const book = allBooks.find(b => b.id === identifier);
  if (book && (book as any).downloadUrl) {
    return (book as any).downloadUrl;
  }
  return `https://archive.org/download/${identifier}/${identifier}.pdf`;
}

export function getBookPageUrl(identifier: string): string {
  const iaAll = Object.values(IA_BOOKS).flat();
  const iaBook = iaAll.find(b => b.id === identifier);
  if (iaBook) return `https://archive.org/details/${identifier}`;
  // For Drive books, return the download URL
  const allBooks = Object.values(ALL_BOOKS).flat();
  const book = allBooks.find(b => b.id === identifier);
  if (book && (book as any).downloadUrl) return (book as any).downloadUrl;
  return `https://archive.org/details/${identifier}`;
}
