export interface SyllabusChapter {
  chapterName: string;
  topics: string[];
}

export const CBSE_SYLLABUS_MAP: Record<string, Record<string, SyllabusChapter[]>> = {
  "8": {
    "Science": [
      {
        chapterName: "Chapter 1: Crop Production and Management",
        topics: [
          "Agricultural Practices",
          "Basic Practices of Crop Production",
          "Preparation of Soil",
          "Sowing of Seeds",
          "Adding Manure and Fertilisers",
          "Irrigation Methods",
          "Protection from Weeds",
          "Harvesting Crops",
          "Storage of Grains"
        ]
      },
      {
        chapterName: "Chapter 2: Microorganisms: Friend and Foe",
        topics: [
          "Microorganisms Classification",
          "Where do Microorganisms Live?",
          "Friendly Microorganisms",
          "Commercial Use of Microorganisms",
          "Medicinal Use of Microorganisms",
          "Vaccine and Immunity",
          "Harmful Microorganisms",
          "Food Preservation",
          "Nitrogen Fixation & Nitrogen Cycle"
        ]
      },
      {
        chapterName: "Chapter 3: Coal and Petroleum",
        topics: [
          "Natural Resources Classification",
          "Coal and Coal Gas",
          "Petroleum and Petroleum Refining",
          "Natural Gas",
          "Limited Natural Resources Conservation"
        ]
      },
      {
        chapterName: "Chapter 4: Combustion and Flame",
        topics: [
          "What is Combustion?",
          "How do We Control Fire?",
          "Types of Combustion",
          "Flame Zones",
          "Structure of a Flame",
          "What is a Fuel?",
          "Fuel Efficiency & Air Pollution"
        ]
      },
      {
        chapterName: "Chapter 5: Conservation of Plants and Animals",
        topics: [
          "Deforestation and its Causes",
          "Consequences of Deforestation",
          "Biosphere Reserves",
          "Flora and Fauna",
          "Endemic Species",
          "Wildlife Sanctuary",
          "National Parks",
          "Red Data Book",
          "Migration",
          "Reforestation"
        ]
      },
      {
        chapterName: "Chapter 6: Reproduction in Animals",
        topics: [
          "Modes of Reproduction",
          "Sexual Reproduction in Animals",
          "Male and Female Reproductive Organs",
          "Fertilization and Zygote",
          "Development of Embryo",
          "Viviparous and Oviparous Animals",
          "Asexual Reproduction in Animals"
        ]
      },
      {
        chapterName: "Chapter 7: Reaching the Age of Adolescence",
        topics: [
          "Adolescence and Puberty",
          "Changes at Puberty",
          "Secondary Sexual Characters",
          "Role of Hormones in Initiating Reproductive Function",
          "Reproductive Phase of Life in Humans",
          "How is the Sex of the Baby Determined?",
          "Hormones other than Sex Hormones",
          "Role of Hormones in Completing Life History of Insects and Frogs",
          "Reproductive Health"
        ]
      },
      {
        chapterName: "Chapter 8: Force and Pressure",
        topics: [
          "Force: A Push or a Pull",
          "Forces are due to an Interaction",
          "Exploring Forces",
          "Force Can Change the State of Motion",
          "Force Can Change the Shape of an Object",
          "Contact Forces (Muscular & Friction)",
          "Non-contact Forces (Magnetic, Electrostatic, Gravitational)",
          "Pressure & Atmospheric Pressure"
        ]
      },
      {
        chapterName: "Chapter 9: Friction",
        topics: [
          "Force of Friction",
          "Factors affecting Friction",
          "Friction: A Necessary Evil",
          "Increasing and Reducing Friction",
          "Wheels Reduce Friction (Rolling Friction)",
          "Fluid Friction (Drag)"
        ]
      },
      {
        chapterName: "Chapter 10: Sound",
        topics: [
          "Sound is Produced by a Vibrating Body",
          "Sound Produced by Humans (Larynx)",
          "Sound Needs a Medium for Propagation",
          "We Hear Sound through Our Ears",
          "Amplitude, Time Period and Frequency of a Vibration",
          "Loudness and Pitch",
          "Audible and Inaudible Sounds",
          "Noise and Music",
          "Noise Pollution Control"
        ]
      },
      {
        chapterName: "Chapter 11: Chemical Effects of Electric Current",
        topics: [
          "Do Liquids Conduct Electricity?",
          "Chemical Effects of Electric Current",
          "Electroplating and its Applications"
        ]
      },
      {
        chapterName: "Chapter 12: Some Natural Phenomena",
        topics: [
          "Lightning and Charging by Rubbing",
          "Types of Charges and their Interaction",
          "Transfer of Charge & Electroscope",
          "Story of Lightning & Lightning Conductors",
          "Earthquakes & Seismic Waves",
          "Protection against Earthquakes"
        ]
      },
      {
        chapterName: "Chapter 13: Light",
        topics: [
          "What makes Things Visible?",
          "Laws of Reflection",
          "Regular and Diffused Reflection",
          "Reflected Light can be Reflected Again",
          "Multiple Images & Kaleidoscope",
          "Sunlight: White or Coloured?",
          "What is inside Our Eyes?",
          "Care of the Eyes",
          "Visually Impaired Persons & Braille System"
        ]
      }
    ],
    "Mathematics": [
      {
        chapterName: "Chapter 1: Rational Numbers",
        topics: [
          "Properties of Rational Numbers",
          "Closure & Commutativity",
          "Associativity of Numbers",
          "The Role of Zero and One",
          "Negative of a Number",
          "Reciprocal / Multiplicative Inverse",
          "Distributivity of Multiplication over Addition",
          "Representation of Rational Numbers on Number Line",
          "Rational Numbers between Two Rational Numbers"
        ]
      },
      {
        chapterName: "Chapter 2: Linear Equations in One Variable",
        topics: [
          "Solving Equations which have Linear Expressions on one side and Numbers on the other",
          "Applications / Word Problems",
          "Solving Equations having the Variable on both sides",
          "Reducing Equations to Simpler Form",
          "Equations Reducible to Linear Form"
        ]
      },
      {
        chapterName: "Chapter 3: Understanding Quadrilaterals",
        topics: [
          "Polygons Classification",
          "Diagonals and Convex/Concave Polygons",
          "Regular and Irregular Polygons",
          "Angle Sum Property",
          "Sum of the Measures of the Exterior Angles of a Polygon",
          "Kinds of Quadrilaterals (Trapezium & Kite)",
          "Parallelogram & its Elements",
          "Angles and Diagonals of a Parallelogram",
          "Some Special Parallelograms (Rhombus, Rectangle, Square)"
        ]
      },
      {
        chapterName: "Chapter 4: Data Handling",
        topics: [
          "Looking for Information (Data)",
          "Organising Data & Grouping Data",
          "Bars with a Difference (Histograms)",
          "Circle Graph or Pie Chart",
          "Chance and Probability"
        ]
      },
      {
        chapterName: "Chapter 5: Squares and Square Roots",
        topics: [
          "Properties of Square Numbers",
          "Interesting Patterns in Square Numbers",
          "Finding the Square of a Number",
          "Pythagorean Triplets",
          "Square Roots & Finding Square Root by Prime Factorisation",
          "Square Root by Division Method",
          "Square Roots of Decimals",
          "Estimating Square Root"
        ]
      },
      {
        chapterName: "Chapter 6: Cubes and Cube Roots",
        topics: [
          "Cubes and Hardy-Ramanujan Numbers",
          "Patterns in Cube Numbers",
          "Smallest Multiple that is a Perfect Cube",
          "Cube Roots by Prime Factorisation Method",
          "Cube Root of a Cube Number by Estimation"
        ]
      },
      {
        chapterName: "Chapter 7: Comparing Quantities",
        topics: [
          "Recalling Ratios and Percentages",
          "Finding the Increase or Decrease Percent",
          "Finding Discounts & Estimation in Percentages",
          "Prices Related to Buying and Selling (Profit and Loss)",
          "Sales Tax / Value Added Tax / GST",
          "Simple Interest & Compound Interest Formula",
          "Deducing a Formula for Compound Interest",
          "Applications of Compound Interest Formula"
        ]
      },
      {
        chapterName: "Chapter 8: Algebraic Expressions and Identities",
        topics: [
          "What are Expressions?",
          "Terms, Factors and Coefficients",
          "Monomials, Binomials and Polynomials",
          "Like and Unlike Terms",
          "Addition and Subtraction of Algebraic Expressions",
          "Multiplication of Algebraic Expressions",
          "Multiplying a Monomial by a Monomial",
          "Multiplying a Monomial by a Polynomial",
          "Multiplying a Polynomial by a Polynomial",
          "What is an Identity?",
          "Standard Identities & Applying Identities"
        ]
      },
      {
        chapterName: "Chapter 9: Mensuration",
        topics: [
          "Area of Trapezium",
          "Area of a General Quadrilateral & Special Quadrilaterals",
          "Area of a Polygon",
          "Solid Shapes & Surface Area of Cube, Cuboid and Cylinder",
          "Volume of Cube, Cuboid and Cylinder",
          "Volume and Capacity"
        ]
      },
      {
        chapterName: "Chapter 10: Exponents and Powers",
        topics: [
          "Powers with Negative Exponents",
          "Laws of Exponents",
          "Use of Exponents to Express Small Numbers in Standard Form",
          "Comparing Very Large and Very Small Numbers"
        ]
      },
      {
        chapterName: "Chapter 11: Direct and Inverse Proportions",
        topics: [
          "Direct Proportion",
          "Inverse Proportion",
          "Direct vs Inverse Proportions Word Problems"
        ]
      },
      {
        chapterName: "Chapter 12: Factorisation",
        topics: [
          "Factors of Algebraic Expressions",
          "What is Factorisation?",
          "Method of Common Factors",
          "Factorisation by Regrouping Terms",
          "Factorisation using Identities",
          "Factors of the Form (x+a)(x+b)",
          "Division of Algebraic Expressions",
          "Division of a Monomial by another Monomial",
          "Division of a Polynomial by a Monomial",
          "Division of Algebraic Expressions by Polynomials",
          "Can you Find the Error? (Cryptic Algebra Errors)"
        ]
      },
      {
        chapterName: "Chapter 13: Introduction to Graphs",
        topics: [
          "A Line Graph",
          "Linear Graphs & Coordinates",
          "Some Applications of Graphs"
        ]
      }
    ]
  },
  "9": {
    "Science": [
      {
        chapterName: "Chapter 1: Matter in Our Surroundings",
        topics: [
          "Physical Nature of Matter",
          "Characteristics of Particles of Matter",
          "States of Matter (Solid, Liquid, Gas)",
          "Can Matter Change its State?",
          "Effect of Change of Temperature & Pressure",
          "Evaporation & Factors Affecting Evaporation"
        ]
      },
      {
        chapterName: "Chapter 2: Is Matter Around Us Pure?",
        topics: [
          "What is a Mixture?",
          "What is a Solution?",
          "Properties and Concentration of a Solution",
          "Suspension & Colloid",
          "Separating the Components of a Mixture",
          "Physical and Chemical Changes",
          "Types of Pure Substances (Elements and Compounds)"
        ]
      },
      {
        chapterName: "Chapter 3: Atoms and Molecules",
        topics: [
          "Laws of Chemical Combination",
          "Law of Conservation of Mass",
          "Law of Constant Proportions",
          "What is an Atom? & Atomic Mass",
          "What is a Molecule?",
          "Writing Chemical Formulae",
          "Molecular Mass and Mole Concept"
        ]
      },
      {
        chapterName: "Chapter 4: Structure of the Atom",
        topics: [
          "Charged Particles in Matter",
          "Thomson's Model of Atom",
          "Rutherford's Model of Atom",
          "Bohr's Model of Atom",
          "Neutrons & Distribution of Electrons in Shells",
          "Valency & Atomic Number and Mass Number",
          "Isotopes and Isobars"
        ]
      },
      {
        chapterName: "Chapter 5: The Fundamental Unit of Life",
        topics: [
          "What are Living Organisms Made of?",
          "Structure of Cell",
          "Plasma Membrane & Diffusion/Osmosis",
          "Cell Wall",
          "Nucleus and Cytoplasm",
          "Cell Organelles (Endoplasmic Reticulum, Golgi Apparatus, Lysosomes, Mitochondria, Plastids, Vacuoles)",
          "Cell Division (Mitosis and Meiosis)"
        ]
      },
      {
        chapterName: "Chapter 6: Tissues",
        topics: [
          "Are Plants and Animals Made of Same Types of Tissues?",
          "Plant Tissues (Meristematic & Permanent)",
          "Animal Tissues (Epithelial, Connective, Muscular, Nervous Tissues)"
        ]
      },
      {
        chapterName: "Chapter 7: Motion",
        topics: [
          "Describing Motion & Motion along a Straight Line",
          "Uniform and Non-uniform Motion",
          "Measuring the Rate of Motion (Speed & Velocity)",
          "Rate of Change of Velocity (Acceleration)",
          "Graphical Representation of Motion",
          "Equations of Motion by Graphical Method",
          "Uniform Circular Motion"
        ]
      },
      {
        chapterName: "Chapter 8: Force and Laws of Motion",
        topics: [
          "Balanced and Unbalanced Forces",
          "First Law of Motion & Inertia and Mass",
          "Second Law of Motion (Mathematical Formulation)",
          "Third Law of Motion & Conservation of Momentum"
        ]
      },
      {
        chapterName: "Chapter 9: Gravitation",
        topics: [
          "Universal Law of Gravitation & Importance",
          "Free Fall & Acceleration due to Gravity (g)",
          "Mass vs Weight & Weight of Object on Moon",
          "Thrust and Pressure & Archimedes' Principle",
          "Relative Density"
        ]
      },
      {
        chapterName: "Chapter 10: Work and Energy",
        topics: [
          "Work done by a Constant Force",
          "Energy & Forms of Energy",
          "Kinetic Energy",
          "Potential Energy",
          "Are various Energy Forms Interconvertible?",
          "Law of Conservation of Energy",
          "Rate of Doing Work (Power)"
        ]
      },
      {
        chapterName: "Chapter 11: Sound",
        topics: [
          "Production of Sound & Propagation of Sound",
          "Sound Needs a Medium to Travel",
          "Sound Waves are Longitudinal Waves",
          "Characteristics of a Sound Wave",
          "Speed of Sound in different Media",
          "Reflection of Sound & Echo/Reverberation",
          "Range of Hearing",
          "Applications of Ultrasound & SONAR",
          "Structure of Human Ear"
        ]
      },
      {
        chapterName: "Chapter 12: Improvement in Food Resources",
        topics: [
          "Improvement in Crop Yields",
          "Crop Variety Improvement",
          "Crop Production Management (Nutrients, Irrigation, Cropping Patterns)",
          "Crop Protection Management",
          "Animal Husbandry (Cattle, Poultry, Fish production, Beekeeping)"
        ]
      }
    ],
    "Mathematics": [
      {
        chapterName: "Chapter 1: Number Systems",
        topics: [
          "Irrational Numbers",
          "Real Numbers and their Decimal Expansions",
          "Representing Real Numbers on the Number Line",
          "Operations on Real Numbers",
          "Laws of Exponents for Real Numbers"
        ]
      },
      {
        chapterName: "Chapter 2: Polynomials",
        topics: [
          "Polynomials in One Variable",
          "Zeroes of a Polynomial",
          "Remainder Theorem",
          "Factorisation of Polynomials",
          "Algebraic Identities"
        ]
      },
      {
        chapterName: "Chapter 3: Coordinate Geometry",
        topics: [
          "Cartesian System",
          "Plotting a Point in the Plane if its Coordinates are Given"
        ]
      },
      {
        chapterName: "Chapter 4: Linear Equations in Two Variables",
        topics: [
          "Linear Equations",
          "Solution of a Linear Equation",
          "Graph of a Linear Equation in Two Variables",
          "Equations of Lines Parallel to x-axis and y-axis"
        ]
      },
      {
        chapterName: "Chapter 5: Introduction to Euclid's Geometry",
        topics: [
          "Euclid's Definitions, Axioms and Postulates",
          "Equivalent Versions of Euclid's Fifth Postulate"
        ]
      },
      {
        chapterName: "Chapter 6: Lines and Angles",
        topics: [
          "Basic Terms and Definitions",
          "Intersecting Lines and Non-intersecting Lines",
          "Pairs of Angles",
          "Parallel Lines and a Transversal",
          "Lines Parallel to the Same Line",
          "Angle Sum Property of a Triangle"
        ]
      },
      {
        chapterName: "Chapter 7: Triangles",
        topics: [
          "Congruence of Triangles",
          "Criteria for Congruence of Triangles (SAS, ASA)",
          "Some Properties of a Triangle",
          "Some More Criteria for Congruence of Triangles (SSS, RHS)",
          "Inequalities in a Triangle"
        ]
      },
      {
        chapterName: "Chapter 8: Quadrilaterals",
        topics: [
          "Properties of a Parallelogram",
          "Another Condition for a Quadrilateral to be a Parallelogram",
          "The Mid-point Theorem"
        ]
      },
      {
        chapterName: "Chapter 9: Areas of Parallelograms and Triangles",
        topics: [
          "Figures on the Same Base and Between the Same Parallels",
          "Parallelograms on the Same Base and Between the Same Parallels",
          "Triangles on the Same Base and Between the Same Parallels"
        ]
      },
      {
        chapterName: "Chapter 10: Circles",
        topics: [
          "Angle Subtended by a Chord at a Point",
          "Perpendicular from the Centre to a Chord",
          "Circle through Three Points",
          "Equal Chords and their Distances from the Centre",
          "Angle Subtended by an Arc of a Circle",
          "Cyclic Quadrilaterals"
        ]
      },
      {
        chapterName: "Chapter 11: Heron's Formula",
        topics: [
          "Area of a Triangle - by Heron's Formula",
          "Application of Heron's Formula in Finding Areas of Quadrilaterals"
        ]
      },
      {
        chapterName: "Chapter 12: Surface Areas and Volumes",
        topics: [
          "Surface Area of a Right Circular Cone",
          "Surface Area of a Sphere",
          "Volume of a Cylinder",
          "Volume of a Right Circular Cone",
          "Volume of a Sphere"
        ]
      },
      {
        chapterName: "Chapter 13: Statistics",
        topics: [
          "Collection of Data & Presentation of Data",
          "Graphical Representation of Data (Histograms, Frequency Polygons)",
          "Measures of Central Tendency (Mean, Median, Mode)"
        ]
      },
      {
        chapterName: "Chapter 14: Probability",
        topics: [
          "Probability - an Experimental Approach"
        ]
      }
    ]
  },
  "10": {
    "Science": [
      {
        chapterName: "Chapter 1: Chemical Reactions and Equations",
        topics: [
          "Chemical Equations Writing and Balancing",
          "Types of Chemical Reactions",
          "Combination, Decomposition, Displacement Reactions",
          "Double Displacement Reactions",
          "Oxidation and Reduction (Redox)",
          "Corrosion & Rancidity in Everyday Life"
        ]
      },
      {
        chapterName: "Chapter 2: Acids, Bases and Salts",
        topics: [
          "Chemical Properties of Acids and Bases",
          "How do Acids and Bases React with Metals?",
          "Reaction of Metal Carbonates/Bicarbonates with Acids",
          "Common features of all Acids and all Bases",
          "How Strong are Acid/Base Solutions? (pH Scale)",
          "Importance of pH in Everyday Life",
          "Chemicals from Common Salt (NaOH, Bleaching Powder, Baking Soda, Washing Soda, Plaster of Paris)"
        ]
      },
      {
        chapterName: "Chapter 3: Metals and Non-metals",
        topics: [
          "Physical Properties of Metals and Non-metals",
          "Chemical Properties of Metals",
          "How do Metals React with Water and Acids?",
          "How do Metals React with Solutions of other Metal Salts?",
          "How do Metals and Non-metals React? & Ionic Compounds Properties",
          "Extraction of Metals (Metallurgy)",
          "Refining of Metals & Prevention of Corrosion"
        ]
      },
      {
        chapterName: "Chapter 4: Carbon and its Compounds",
        topics: [
          "Bonding in Carbon - Covalent Bond",
          "Versatile Nature of Carbon (Catenation & Tetravalency)",
          "Saturated and Unsaturated Carbon Compounds",
          "Chains, Branches and Rings",
          "Homologous Series & Nomenclature of Carbon Compounds",
          "Chemical Properties of Carbon Compounds (Combustion, Oxidation, Addition, Substitution)",
          "Some Important Carbon Compounds: Ethanol and Ethanoic Acid",
          "Soaps and Detergents & Micelle Formation"
        ]
      },
      {
        chapterName: "Chapter 5: Life Processes",
        topics: [
          "What are Life Processes?",
          "Nutrition (Autotrophic & Heterotrophic Nutrition)",
          "Nutrition in Human Beings (Digestive System)",
          "Respiration (Aerobic vs Anaerobic & Human Respiratory System)",
          "Transportation in Human Beings (Heart, Blood Vessels, Lymph)",
          "Transportation in Plants (Xylem & Phloem)",
          "Excretion in Human Beings (Nephron Structure)",
          "Excretion in Plants"
        ]
      },
      {
        chapterName: "Chapter 6: Control and Coordination",
        topics: [
          "Animals - Nervous System & Reflex Actions",
          "Human Brain (Forebrain, Midbrain, Hindbrain)",
          "How are Nervous Tissues Protected?",
          "How does Nervous Tissue Cause Action?",
          "Coordination in Plants & Immediate Response to Stimulus",
          "Movement due to Growth & Plant Hormones",
          "Hormones in Animals (Endocrine Glands, Thyroid, Adrenal, Pancreas, Pituitary)"
        ]
      },
      {
        chapterName: "Chapter 7: How do Organisms Reproduce?",
        topics: [
          "Do Organisms Create Exact Copies of Themselves?",
          "The Importance of Variation",
          "Asexual Modes of Reproduction (Fission, Fragmentation, Regeneration, Budding, Vegetative Propagation, Spore Formation)",
          "Sexual Reproduction & Why Sexual Mode?",
          "Sexual Reproduction in Flowering Plants (Pollination & Fertilization)",
          "Sexual Reproduction in Human Beings & Male/Female Reproductive Systems",
          "What happens when Egg is not Fertilised?",
          "Reproductive Health & Contraceptive Methods"
        ]
      },
      {
        chapterName: "Chapter 8: Heredity",
        topics: [
          "Accumulation of Variation during Reproduction",
          "Heredity & Inherited Traits",
          "Rules for the Inheritance of Traits - Mendel's Contributions",
          "How do these Traits get Expressed?",
          "Sex Determination (XY Chromosomes)"
        ]
      },
      {
        chapterName: "Chapter 9: Light - Reflection and Refraction",
        topics: [
          "Reflection of Light",
          "Spherical Mirrors & Image Formation by Spherical Mirrors",
          "Representation of Images Using Ray Diagrams",
          "Sign Convention for Reflection by Spherical Mirrors",
          "Mirror Formula and Magnification",
          "Refraction of Light & Refraction through Rectangular Glass Slab",
          "The Refractive Index",
          "Refraction by Spherical Lenses & Image Formation",
          "Sign Convention for Spherical Lenses",
          "Lens Formula and Magnification & Power of a Lens"
        ]
      },
      {
        chapterName: "Chapter 10: The Human Eye and the Colorful World",
        topics: [
          "The Human Eye & Power of Accommodation",
          "Defects of Vision and their Correction (Myopia, Hypermetropia, Presbyopia)",
          "Refraction of Light through a Prism",
          "Dispersion of White Light by a Glass Prism & Rainbow Formation",
          "Atmospheric Refraction (Twinkling of stars, Advanced sunrise/delayed sunset)",
          "Scattering of Light & Tyndall Effect",
          "Why is the color of the clear sky blue?",
          "Color of the sun at sunrise and sunset"
        ]
      },
      {
        chapterName: "Chapter 11: Electricity",
        topics: [
          "Electric Current and Circuit",
          "Electric Potential and Potential Difference",
          "Circuit Diagram Symbols",
          "Ohm's Law & Factors on which Resistance Depends",
          "Resistance of a System of Resistors (Series & Parallel)",
          "Heating Effects of Electric Current & Practical Applications",
          "Electric Power & Commercial Unit of Electrical Energy"
        ]
      },
      {
        chapterName: "Chapter 12: Magnetic Effects of Electric Current",
        topics: [
          "Magnetic Field and Field Lines",
          "Magnetic Field due to a Current-Carrying Conductor",
          "Right Hand Thumb Rule",
          "Magnetic Field due to Current through Circular Loop & Solenoid",
          "Force on a Current-Carrying Conductor in Magnetic Field",
          "Fleming's Left Hand Rule",
          "Domestic Electric Circuits & Fuse/Earthing"
        ]
      },
      {
        chapterName: "Chapter 13: Our Environment",
        topics: [
          "Ecosystem — What are its Components?",
          "Food Chains and Food Webs",
          "Ozone Layer and How it is getting Depleted",
          "Managing the Garbage we Produce"
        ]
      }
    ],
    "Mathematics": [
      {
        chapterName: "Chapter 1: Real Numbers",
        topics: [
          "The Fundamental Theorem of Arithmetic",
          "Revisiting Irrational Numbers & Proof of Irrationality"
        ]
      },
      {
        chapterName: "Chapter 2: Polynomials",
        topics: [
          "Geometrical Meaning of the Zeroes of a Polynomial",
          "Relationship between Zeroes and Coefficients of a Polynomial"
        ]
      },
      {
        chapterName: "Chapter 3: Pair of Linear Equations in Two Variables",
        topics: [
          "Graphical Method of Solution of a Pair of Linear Equations",
          "Algebraic Methods of Solving a Pair of Linear Equations",
          "Substitution Method",
          "Elimination Method"
        ]
      },
      {
        chapterName: "Chapter 4: Quadratic Equations",
        topics: [
          "Quadratic Equations Standard Form",
          "Solution of a Quadratic Equation by Factorisation",
          "Solution of a Quadratic Equation by Quadratic Formula",
          "Nature of Roots & Discriminant"
        ]
      },
      {
        chapterName: "Chapter 5: Arithmetic Progressions",
        topics: [
          "Arithmetic Progressions Introduction",
          "nth Term of an AP",
          "Sum of First n Terms of an AP"
        ]
      },
      {
        chapterName: "Chapter 6: Triangles",
        topics: [
          "Similar Figures",
          "Similarity of Triangles & Basic Proportionality Theorem",
          "Criteria for Similarity of Triangles (AAA, SAS, SSS)",
          "Pythagorean Theorem and Similarity Proofs"
        ]
      },
      {
        chapterName: "Chapter 7: Coordinate Geometry",
        topics: [
          "Distance Formula",
          "Section Formula & Midpoint Formula"
        ]
      },
      {
        chapterName: "Chapter 8: Introduction to Trigonometry",
        topics: [
          "Trigonometric Ratios",
          "Trigonometric Ratios of Some Specific Angles (30, 45, 60)",
          "Trigonometric Identities (sin^2 + cos^2 = 1)"
        ]
      },
      {
        chapterName: "Chapter 9: Some Applications of Trigonometry",
        topics: [
          "Heights and Distances (Angle of Elevation, Angle of Depression)"
        ]
      },
      {
        chapterName: "Chapter 10: Circles",
        topics: [
          "Tangent to a Circle & Theorem: Tangent is perpendicular to radius",
          "Number of Tangents from a Point on a Circle & Theorem: Equal tangents from external point"
        ]
      },
      {
        chapterName: "Chapter 11: Area Related to Circles",
        topics: [
          "Areas of Sector and Segment of a Circle"
        ]
      },
      {
        chapterName: "Chapter 12: Surface Areas and Volumes",
        topics: [
          "Surface Area of a Combination of Solids",
          "Volume of a Combination of Solids"
        ]
      },
      {
        chapterName: "Chapter 13: Statistics",
        topics: [
          "Mean of Grouped Data (Direct & Assumed Mean Methods)",
          "Mode of Grouped Data",
          "Median of Grouped Data & Graphical Cumulative Frequency"
        ]
      },
      {
        chapterName: "Chapter 14: Probability",
        topics: [
          "Probability — A Theoretical Approach"
        ]
      }
    ]
  }
};

/**
 * Normalizes grade string (e.g. "Grade 10", "10th", "10") to a standard key ("8", "9", "10").
 */
export function getNormalizedGrade(gradeStr: string): string {
  const digits = gradeStr.replace(/\D/g, "");
  if (["8", "9", "10"].includes(digits)) return digits;
  // fallback to nearest or default
  const num = parseInt(digits, 10);
  if (num <= 8) return "8";
  if (num >= 10) return "10";
  return "8"; // default
}

/**
 * Normalizes subject string to "Science" or "Mathematics".
 */
export function getNormalizedSubject(subjectStr: string): string {
  const s = subjectStr.toLowerCase();
  if (s.includes("math") || s.includes("algebra") || s.includes("geometry") || s.includes("arithmetic")) {
    return "Mathematics";
  }
  return "Science"; // default to Science for others
}

/**
 * Fetches the chapters list for a given grade and subject.
 */
export function getSyllabusChapters(gradeStr: string, subjectStr: string): SyllabusChapter[] {
  const gradeKey = getNormalizedGrade(gradeStr);
  const subjectKey = getNormalizedSubject(subjectStr);
  return CBSE_SYLLABUS_MAP[gradeKey]?.[subjectKey] || CBSE_SYLLABUS_MAP["8"]["Science"];
}
