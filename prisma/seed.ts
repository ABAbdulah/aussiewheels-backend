import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// A rotating pool of stable Unsplash *car* photos. The frontend <CarImage>
// degrades to a branded placeholder if any URL fails, so broken links are safe.
// (Production would use seller-uploaded photos per listing.)
const PHOTOS = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70", // red sports car
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",    // silver coupe
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8", // muscle car
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888", // grey sports car
  "https://images.unsplash.com/photo-1542362567-b07e54358753",    // suv on road
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2", // sedan front
  "https://images.unsplash.com/photo-1617469767053-d3b523a0b982", // ev charging
  "https://images.unsplash.com/photo-1568844293986-8d0400bd4745", // hatch
  "https://images.unsplash.com/photo-1549924231-f129b911e442",    // car rear
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7", // parked car
];

const img = (i: number, n = 5) =>
  Array.from({ length: n }, (_, k) => {
    const base = PHOTOS[(i * 3 + k) % PHOTOS.length];
    return `${base}?auto=format&fit=crop&w=1280&q=70`;
  });

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type Row = Omit<Prisma.ListingCreateInput, "slug" | "images"> & {
  _imgCount?: number;
};

const rows: Row[] = [
  {
    make: "Toyota", model: "RAV4", variant: "GX Hybrid", year: 2022,
    price: 38990, driveawayPrice: 41250, priceIndicator: "GREAT",
    odometer: 42100, transmission: "Automatic", fuel: "Hybrid", bodyType: "SUV",
    driveType: "AWD", doors: 5, seats: 5, colour: "Eclipse Black", engine: "2.5L 4cyl",
    cylinders: 4, powerKw: 160, condition: "USED", sellerType: "DEALER",
    sellerName: "Sydney City Toyota", suburb: "Parramatta", state: "NSW",
    description:
      "One-owner RAV4 GX Hybrid with full Toyota service history. Combines real-world fuel economy of around 4.8L/100km with the practicality of AWD. Balance of new-car warranty remaining.",
    features: ["Apple CarPlay & Android Auto", "Adaptive cruise control", "Reversing camera", "Lane-keep assist", "Dual-zone climate"],
    warrantyMonths: 24, warrantyKm: 60000, tradeInEligible: true, reviewScore: 84,
  },
  {
    make: "Mazda", model: "CX-5", variant: "Maxx Sport", year: 2021,
    price: 34500, driveawayPrice: 36400, priceIndicator: "GOOD",
    odometer: 58000, transmission: "Automatic", fuel: "Petrol", bodyType: "SUV",
    driveType: "FWD", doors: 5, seats: 5, colour: "Soul Red Crystal", engine: "2.5L 4cyl",
    cylinders: 4, powerKw: 140, condition: "USED", sellerType: "DEALER",
    sellerName: "Brunswick Prestige Cars", suburb: "Brunswick", state: "VIC",
    description:
      "Stylish CX-5 Maxx Sport finished in the iconic Soul Red Crystal. Well maintained with logbooks, recently serviced and detailed, ready to drive away.",
    features: ["Heated front seats", "Sat-nav", "Blind-spot monitoring", "Keyless entry & start", "18\" alloys"],
    warrantyMonths: 12, warrantyKm: 40000, tradeInEligible: true, reviewScore: 79,
  },
  {
    make: "Tesla", model: "Model 3", variant: "RWD", year: 2023,
    price: 54990, driveawayPrice: 57100, priceIndicator: "GREAT",
    odometer: 21000, transmission: "Automatic", fuel: "Electric", bodyType: "Sedan",
    driveType: "RWD", doors: 4, seats: 5, colour: "Pearl White", engine: "Single motor",
    powerKw: 208, condition: "USED", sellerType: "PRIVATE", sellerName: "James",
    suburb: "Fortitude Valley", state: "QLD",
    description:
      "Immaculate Model 3 RWD with the updated interior. Tesla connectivity, Autopilot, and free supercharging credits remaining. Always garaged, non-smoker.",
    features: ["Autopilot", "15\" touchscreen", "Glass roof", "Heat pump", "Over-the-air updates"],
    evRangeKm: 513, specialOffer: false, tradeInEligible: false, reviewScore: 86,
  },
  {
    make: "Ford", model: "Ranger", variant: "Wildtrak 2.0 Bi-Turbo", year: 2022,
    price: 58900, driveawayPrice: 61500, priceIndicator: "FAIR",
    odometer: 49500, transmission: "Automatic", fuel: "Diesel", bodyType: "Ute",
    driveType: "4x4", doors: 4, seats: 5, colour: "Meteor Grey", engine: "2.0L Bi-Turbo 4cyl",
    cylinders: 4, powerKw: 154, condition: "USED", sellerType: "DEALER",
    sellerName: "Mandurah 4x4 Centre", suburb: "Mandurah", state: "WA",
    description:
      "Tough and capable Ranger Wildtrak with the proven 2.0 Bi-Turbo and 10-speed auto. Genuine hardtop canopy, tow pack, and tub liner fitted.",
    features: ["Towbar (3500kg)", "Hardtop canopy", "Sports bar", "360 camera", "Matrix LED headlights"],
    warrantyMonths: 24, warrantyKm: 80000, specialOffer: true, tradeInEligible: true, reviewScore: 88,
  },
  {
    make: "Volkswagen", model: "Golf", variant: "R 2.0 TSI", year: 2020,
    price: 41990, driveawayPrice: 43900, priceIndicator: "GOOD",
    odometer: 62000, transmission: "Automatic", fuel: "Petrol", bodyType: "Hatch",
    driveType: "AWD", doors: 5, seats: 5, colour: "Lapiz Blue", engine: "2.0L Turbo 4cyl",
    cylinders: 4, powerKw: 213, condition: "USED", sellerType: "PRIVATE", sellerName: "Daniel",
    suburb: "Norwood", state: "SA",
    description:
      "Enthusiast-owned Golf R in the sought-after Lapiz Blue. 4MOTION all-wheel drive, DSG, and a full service history. A genuine hot hatch icon.",
    features: ["4MOTION AWD", "DSG paddle shift", "Digital cockpit", "Dynaudio sound", "19\" Pretoria alloys"],
    warrantyMonths: 6, warrantyKm: 20000, tradeInEligible: false, reviewScore: 85,
  },
  {
    make: "Hyundai", model: "i30", variant: "Active", year: 2021,
    price: 24990, driveawayPrice: 26400, priceIndicator: "GREAT",
    odometer: 38000, transmission: "Automatic", fuel: "Petrol", bodyType: "Hatch",
    driveType: "FWD", doors: 5, seats: 5, colour: "Polar White", engine: "2.0L 4cyl",
    cylinders: 4, powerKw: 120, condition: "USED", sellerType: "DEALER",
    sellerName: "Westside Hyundai", suburb: "Penrith", state: "NSW",
    description:
      "Affordable and economical i30 Active — the perfect first car or daily commuter. Remaining factory warranty and capped-price servicing available.",
    features: ["Apple CarPlay", "Reversing camera", "Cruise control", "Autonomous emergency braking", "Bluetooth"],
    warrantyMonths: 24, warrantyKm: 60000, tradeInEligible: true, reviewScore: 78,
  },
  {
    make: "Kia", model: "Sportage", variant: "GT-Line", year: 2023,
    price: 46990, driveawayPrice: 49200, priceIndicator: "GOOD",
    odometer: 18500, transmission: "Automatic", fuel: "Diesel", bodyType: "SUV",
    driveType: "AWD", doors: 5, seats: 5, colour: "Steel Grey", engine: "1.6L Turbo Diesel",
    cylinders: 4, powerKw: 137, condition: "DEMO", sellerType: "DEALER",
    sellerName: "Gold Coast Kia", suburb: "Southport", state: "QLD",
    description:
      "Near-new Sportage GT-Line demonstrator with the flagship spec. Panoramic curved display, heated and cooled seats, and the remaining 7-year warranty.",
    features: ["Panoramic display", "Heated & cooled seats", "Harman Kardon audio", "Power tailgate", "Highway driving assist"],
    warrantyMonths: 72, warrantyKm: 150000, specialOffer: true, tradeInEligible: true, reviewScore: 83,
  },
  {
    make: "BMW", model: "330i", variant: "M Sport", year: 2021,
    price: 62900, driveawayPrice: 65800, priceIndicator: "FAIR",
    odometer: 44000, transmission: "Automatic", fuel: "Petrol", bodyType: "Sedan",
    driveType: "RWD", doors: 4, seats: 5, colour: "Alpine White", engine: "2.0L Turbo 4cyl",
    cylinders: 4, powerKw: 190, condition: "USED", sellerType: "DEALER",
    sellerName: "Doncaster European", suburb: "Doncaster", state: "VIC",
    description:
      "G20 330i with the desirable M Sport package. Full BMW service history, sunroof, and the Live Cockpit Professional. Drives as new.",
    features: ["M Sport package", "Sunroof", "Live Cockpit Pro", "Harman Kardon", "Wireless charging"],
    warrantyMonths: 12, warrantyKm: 40000, tradeInEligible: true, reviewScore: 87,
  },
  {
    make: "Mercedes-Benz", model: "GLC 300", variant: "4MATIC", year: 2022,
    price: 79900, driveawayPrice: 83400, priceIndicator: "FAIR",
    odometer: 31000, transmission: "Automatic", fuel: "Petrol", bodyType: "SUV",
    driveType: "AWD", doors: 5, seats: 5, colour: "Obsidian Black", engine: "2.0L Turbo 4cyl",
    cylinders: 4, powerKw: 190, condition: "USED", sellerType: "DEALER",
    sellerName: "Mercedes-Benz Canberra", suburb: "Phillip", state: "ACT",
    description:
      "Luxurious GLC 300 4MATIC with AMG Line styling and the panoramic roof. One owner, immaculate inside and out, with balance of MB warranty.",
    features: ["AMG Line", "Panoramic roof", "Burmester sound", "MBUX voice control", "Air suspension"],
    warrantyMonths: 18, warrantyKm: 50000, tradeInEligible: true, reviewScore: 82,
  },
  {
    make: "Subaru", model: "Outback", variant: "AWD Touring", year: 2021,
    price: 42990, driveawayPrice: 45100, priceIndicator: "GOOD",
    odometer: 53000, transmission: "Automatic", fuel: "Petrol", bodyType: "Wagon",
    driveType: "AWD", doors: 5, seats: 5, colour: "Autumn Green", engine: "2.5L 4cyl Boxer",
    cylinders: 4, powerKw: 138, condition: "USED", sellerType: "DEALER",
    sellerName: "Hobart Subaru", suburb: "Moonah", state: "TAS",
    description:
      "The do-everything Outback Touring with symmetrical AWD and X-MODE. Ideal for Tassie roads and weekend escapes. Full leather and EyeSight safety.",
    features: ["EyeSight safety", "X-MODE", "Leather trim", "Power tailgate", "Roof rails"],
    warrantyMonths: 12, warrantyKm: 40000, tradeInEligible: true, reviewScore: 80,
  },
  {
    make: "Mitsubishi", model: "Triton", variant: "GLS", year: 2020,
    price: 36990, driveawayPrice: 38900, priceIndicator: "GREAT",
    odometer: 71000, transmission: "Automatic", fuel: "Diesel", bodyType: "Ute",
    driveType: "4x4", doors: 4, seats: 5, colour: "White Diamond", engine: "2.4L Turbo Diesel",
    cylinders: 4, powerKw: 133, condition: "USED", sellerType: "PRIVATE", sellerName: "Mark",
    suburb: "Bunbury", state: "WA",
    description:
      "Hard-working Triton GLS dual cab with super-select 4WD. Tow bar, bull bar, and canopy included. Reliable and economical workhorse.",
    features: ["Bull bar", "Tow bar", "Canopy", "Super-select 4WD", "Reversing camera"],
    tradeInEligible: true, reviewScore: 74,
  },
  {
    make: "Nissan", model: "X-Trail", variant: "ST-L e-POWER", year: 2023,
    price: 48990, driveawayPrice: 51200, priceIndicator: "GOOD",
    odometer: 15000, transmission: "Automatic", fuel: "Hybrid", bodyType: "SUV",
    driveType: "AWD", doors: 5, seats: 7, colour: "Gun Metallic", engine: "1.5L e-POWER",
    cylinders: 3, powerKw: 150, condition: "DEMO", sellerType: "DEALER",
    sellerName: "Northshore Nissan", suburb: "Artarmon", state: "NSW",
    description:
      "Innovative X-Trail e-POWER — petrol engine acts purely as a generator for an EV-like drive. Seven seats, near-new with the full warranty.",
    features: ["e-POWER hybrid", "7 seats", "ProPILOT", "Around View Monitor", "Tri-zone climate"],
    warrantyMonths: 60, warrantyKm: 120000, tradeInEligible: true, reviewScore: 81,
  },
  {
    make: "Honda", model: "Civic", variant: "VTi-LX", year: 2022,
    price: 39990, driveawayPrice: 41900, priceIndicator: "FAIR",
    odometer: 27000, transmission: "Automatic", fuel: "Petrol", bodyType: "Hatch",
    driveType: "FWD", doors: 5, seats: 5, colour: "Platinum White", engine: "1.5L Turbo 4cyl",
    cylinders: 4, powerKw: 131, condition: "USED", sellerType: "DEALER",
    sellerName: "Eastern Honda", suburb: "Box Hill", state: "VIC",
    description:
      "Sharp 11th-gen Civic VTi-LX with the premium Bose audio and full Honda Sensing suite. One of the best-driving small cars on the market.",
    features: ["Bose premium audio", "Honda Sensing", "Wireless CarPlay", "Leather appointed", "Adaptive cruise"],
    warrantyMonths: 24, warrantyKm: 60000, tradeInEligible: true, reviewScore: 82,
  },
  {
    make: "BYD", model: "Atto 3", variant: "Extended Range", year: 2023,
    price: 39990, driveawayPrice: 42100, priceIndicator: "GREAT",
    odometer: 19000, transmission: "Automatic", fuel: "Electric", bodyType: "SUV",
    driveType: "FWD", doors: 5, seats: 5, colour: "Surf Blue", engine: "Single motor",
    powerKw: 150, condition: "USED", sellerType: "PRIVATE", sellerName: "Priya",
    suburb: "Carindale", state: "QLD",
    description:
      "Feature-packed Atto 3 Extended Range with the Blade battery. Vehicle-to-load, rotating touchscreen, and a roomy cabin. Charging cables included.",
    features: ["Blade battery", "Vehicle-to-load (V2L)", "Rotating 15.6\" screen", "Panoramic roof", "Heat pump"],
    evRangeKm: 420, tradeInEligible: true, reviewScore: 77,
  },
  {
    make: "MG", model: "MG3", variant: "Core", year: 2024,
    price: 21990, driveawayPrice: 22990, priceIndicator: "GREAT",
    odometer: 50, transmission: "Automatic", fuel: "Hybrid", bodyType: "Hatch",
    driveType: "FWD", doors: 5, seats: 5, colour: "Arctic White", engine: "1.5L Hybrid+",
    cylinders: 4, powerKw: 155, condition: "NEW", sellerType: "DEALER",
    sellerName: "MG Liverpool", suburb: "Liverpool", state: "NSW",
    description:
      "Brand-new MG3 Hybrid+ — Australia's most affordable hybrid hatch. Drive away pricing with a 10-year warranty. Limited stock available.",
    features: ["10-year warranty", "Hybrid+ powertrain", "10.25\" touchscreen", "Wireless CarPlay", "Autonomous emergency braking"],
    warrantyMonths: 120, warrantyKm: 250000, specialOffer: true, reviewScore: 73,
  },
  {
    make: "Isuzu", model: "D-MAX", variant: "LS-U+", year: 2021,
    price: 45990, driveawayPrice: 48200, priceIndicator: "GOOD",
    odometer: 64000, transmission: "Automatic", fuel: "Diesel", bodyType: "Ute",
    driveType: "4x4", doors: 4, seats: 5, colour: "Mineral White", engine: "3.0L Turbo Diesel",
    cylinders: 4, powerKw: 140, condition: "USED", sellerType: "DEALER",
    sellerName: "Toowoomba Isuzu UTE", suburb: "Toowoomba", state: "QLD",
    description:
      "Dependable D-MAX LS-U+ with the bulletproof 3.0L turbo diesel. Rough Country lift, all-terrains, and a genuine canopy. Ready for work or play.",
    features: ["2\" suspension lift", "All-terrain tyres", "Genuine canopy", "8-speed auto", "Tow bar (3500kg)"],
    warrantyMonths: 24, warrantyKm: 80000, tradeInEligible: true, reviewScore: 80,
  },
  {
    make: "Audi", model: "Q5", variant: "40 TDI quattro", year: 2020,
    price: 52900, driveawayPrice: 55300, priceIndicator: "FAIR",
    odometer: 58000, transmission: "Automatic", fuel: "Diesel", bodyType: "SUV",
    driveType: "AWD", doors: 5, seats: 5, colour: "Navarra Blue", engine: "2.0L TDI",
    cylinders: 4, powerKw: 140, condition: "USED", sellerType: "DEALER",
    sellerName: "Audi Centre Perth", suburb: "Osborne Park", state: "WA",
    description:
      "Refined Q5 40 TDI quattro with the S line exterior. Virtual cockpit, matrix LED, and a comprehensive service history. Quiet, comfortable and capable.",
    features: ["S line exterior", "Virtual cockpit", "Matrix LED", "Bang & Olufsen", "Quattro AWD"],
    warrantyMonths: 6, warrantyKm: 20000, tradeInEligible: true, reviewScore: 81,
  },
  {
    make: "Volvo", model: "XC40", variant: "Recharge Pure Electric", year: 2022,
    price: 56990, driveawayPrice: 59400, priceIndicator: "GOOD",
    odometer: 28000, transmission: "Automatic", fuel: "Electric", bodyType: "SUV",
    driveType: "AWD", doors: 5, seats: 5, colour: "Fjord Blue", engine: "Twin motor",
    powerKw: 300, condition: "USED", sellerType: "DEALER",
    sellerName: "Volvo Cars Adelaide", suburb: "Mile End", state: "SA",
    description:
      "Quick and safe XC40 Recharge twin-motor with 300kW. Google built-in, Harman Kardon, and the class-leading Volvo safety suite. Balance of warranty.",
    features: ["Google built-in", "Twin motor AWD", "Harman Kardon", "Pilot Assist", "Heat pump"],
    evRangeKm: 418, warrantyMonths: 24, warrantyKm: 60000, tradeInEligible: true, reviewScore: 83,
  },
  {
    make: "Lexus", model: "NX 350h", variant: "Luxury", year: 2023,
    price: 72900, driveawayPrice: 75900, priceIndicator: "FAIR",
    odometer: 22000, transmission: "Automatic", fuel: "Hybrid", bodyType: "SUV",
    driveType: "AWD", doors: 5, seats: 5, colour: "Sonic Chrome", engine: "2.5L Hybrid",
    cylinders: 4, powerKw: 179, condition: "USED", sellerType: "DEALER",
    sellerName: "Lexus of Chadstone", suburb: "Chadstone", state: "VIC",
    description:
      "Elegant NX 350h Luxury hybrid with the panoramic view monitor and Mark Levinson audio. Exceptional refinement and Lexus reliability.",
    features: ["Mark Levinson audio", "Panoramic view monitor", "Heated & ventilated seats", "Wireless charging", "Power tailgate"],
    warrantyMonths: 24, warrantyKm: 60000, tradeInEligible: true, reviewScore: 84,
  },
  {
    make: "Polestar", model: "Polestar 2", variant: "Long Range Single Motor", year: 2022,
    price: 51990, driveawayPrice: 54300, priceIndicator: "GREAT",
    odometer: 33000, transmission: "Automatic", fuel: "Electric", bodyType: "Sedan",
    driveType: "FWD", doors: 5, seats: 5, colour: "Magnesium", engine: "Single motor",
    powerKw: 170, condition: "USED", sellerType: "PRIVATE", sellerName: "Sophie",
    suburb: "Newtown", state: "NSW",
    description:
      "Minimalist Polestar 2 Long Range with Android Automotive and Google Maps native. Sharp Scandinavian design, fast charging, and a fun drive.",
    features: ["Android Automotive", "Pilot Pack", "Fast charging", "Vegan interior", "Frunk storage"],
    evRangeKm: 540, tradeInEligible: false, reviewScore: 82,
  },
  {
    make: "Toyota", model: "LandCruiser", variant: "Prado GXL", year: 2021,
    price: 68990, driveawayPrice: 71900, priceIndicator: "FAIR",
    odometer: 59000, transmission: "Automatic", fuel: "Diesel", bodyType: "SUV",
    driveType: "4x4", doors: 5, seats: 7, colour: "Graphite", engine: "2.8L Turbo Diesel",
    cylinders: 4, powerKw: 150, condition: "USED", sellerType: "DEALER",
    sellerName: "Darwin Toyota", suburb: "Berrimah", state: "NT",
    description:
      "Legendary Prado GXL — the ultimate touring 7-seater. Long-range tank, bull bar, and snorkel fitted. Outstanding off-road and on the highway.",
    features: ["7 seats", "Snorkel", "Bull bar", "Long-range tank", "Kinetic Dynamic Suspension"],
    warrantyMonths: 12, warrantyKm: 40000, tradeInEligible: true, reviewScore: 85,
  },
  {
    make: "Mazda", model: "MX-5", variant: "Roadster GT", year: 2019,
    price: 36990, driveawayPrice: 38800, priceIndicator: "GOOD",
    odometer: 41000, transmission: "Manual", fuel: "Petrol", bodyType: "Convertible",
    driveType: "RWD", doors: 2, seats: 2, colour: "Machine Grey", engine: "2.0L 4cyl",
    cylinders: 4, powerKw: 135, condition: "USED", sellerType: "PRIVATE", sellerName: "Tom",
    suburb: "Cottesloe", state: "WA",
    description:
      "Pure driving joy — MX-5 Roadster GT with the 6-speed manual. Bose audio, heated leather, and a soft top. Cherished and garaged.",
    features: ["6-speed manual", "Bose audio", "Heated leather", "Bilstein dampers", "Soft top"],
    tradeInEligible: false, reviewScore: 86,
  },
  {
    make: "Hyundai", model: "Tucson", variant: "Highlander", year: 2023,
    price: 47990, driveawayPrice: 50100, priceIndicator: "GOOD",
    odometer: 16000, transmission: "Automatic", fuel: "Petrol", bodyType: "SUV",
    driveType: "AWD", doors: 5, seats: 5, colour: "Shimmering Silver", engine: "1.6L Turbo 4cyl",
    cylinders: 4, powerKw: 132, condition: "DEMO", sellerType: "DEALER",
    sellerName: "Macarthur Hyundai", suburb: "Campbelltown", state: "NSW",
    description:
      "Striking Tucson Highlander demonstrator with the full luxury spec. Parametric grille, panoramic roof, and the remaining factory warranty.",
    features: ["Panoramic roof", "Krell audio", "Heated & cooled seats", "Remote smart park assist", "Surround view monitor"],
    warrantyMonths: 60, warrantyKm: 120000, specialOffer: true, tradeInEligible: true, reviewScore: 81,
  },
  {
    make: "Ford", model: "Mustang", variant: "GT 5.0 V8", year: 2020,
    price: 64990, driveawayPrice: 67900, priceIndicator: "FAIR",
    odometer: 38000, transmission: "Manual", fuel: "Petrol", bodyType: "Coupe",
    driveType: "RWD", doors: 2, seats: 4, colour: "Race Red", engine: "5.0L V8",
    cylinders: 8, powerKw: 339, condition: "USED", sellerType: "DEALER",
    sellerName: "Newstead Performance", suburb: "Newstead", state: "QLD",
    description:
      "Iconic Mustang GT with the naturally-aspirated 5.0 Coyote V8 and 6-speed manual. Active exhaust, MagneRide, and a glorious soundtrack.",
    features: ["5.0L Coyote V8", "6-speed manual", "Active valve exhaust", "MagneRide", "Recaro seats"],
    warrantyMonths: 12, warrantyKm: 40000, tradeInEligible: true, reviewScore: 83,
  },
  {
    make: "Kia", model: "EV6", variant: "Air", year: 2023,
    price: 59990, driveawayPrice: 62400, priceIndicator: "GOOD",
    odometer: 24000, transmission: "Automatic", fuel: "Electric", bodyType: "SUV",
    driveType: "RWD", doors: 5, seats: 5, colour: "Moonscape", engine: "Single motor",
    powerKw: 168, condition: "USED", sellerType: "DEALER",
    sellerName: "Essendon Kia", suburb: "Essendon", state: "VIC",
    description:
      "Award-winning EV6 Air with 800V ultra-fast charging — 10 to 80% in 18 minutes. Spacious, quiet and quick. Balance of Kia's 7-year warranty.",
    features: ["800V fast charging", "Vehicle-to-load (V2L)", "Augmented reality HUD", "Heat pump", "Highway driving assist"],
    evRangeKm: 528, warrantyMonths: 72, warrantyKm: 150000, tradeInEligible: true, reviewScore: 85,
  },
  {
    make: "Toyota", model: "Corolla", variant: "Ascent Sport Hybrid", year: 2024,
    price: 32990, driveawayPrice: 34490, priceIndicator: "GREAT",
    odometer: 30, transmission: "Automatic", fuel: "Hybrid", bodyType: "Hatch",
    driveType: "FWD", doors: 5, seats: 5, colour: "Glacier White", engine: "1.8L Hybrid",
    cylinders: 4, powerKw: 103, condition: "NEW", sellerType: "DEALER",
    sellerName: "City Toyota Melbourne", suburb: "Melbourne", state: "VIC",
    description:
      "Brand-new Corolla Ascent Sport Hybrid — Australia's favourite small car. Exceptional economy, Toyota Safety Sense, and drive-away pricing.",
    features: ["Toyota Safety Sense", "Wireless CarPlay", "Hybrid economy ~4.0L/100km", "Adaptive cruise", "8\" touchscreen"],
    warrantyMonths: 60, warrantyKm: 100000, specialOffer: true, reviewScore: 82,
  },
  {
    make: "Nissan", model: "Patrol", variant: "Ti-L", year: 2022,
    price: 89990, driveawayPrice: 93900, priceIndicator: "FAIR",
    odometer: 41000, transmission: "Automatic", fuel: "Petrol", bodyType: "SUV",
    driveType: "4x4", doors: 5, seats: 8, colour: "Brilliant Silver", engine: "5.6L V8",
    cylinders: 8, powerKw: 298, condition: "USED", sellerType: "DEALER",
    sellerName: "Wagga Nissan", suburb: "Wagga Wagga", state: "NSW",
    description:
      "Commanding Patrol Ti-L with the 5.6L V8 — the ultimate large family and touring 4WD. Eight seats, premium leather, and full off-road capability.",
    features: ["5.6L V8", "8 seats", "Hydraulic Body Motion Control", "BOSE audio", "Around View Monitor"],
    warrantyMonths: 24, warrantyKm: 80000, tradeInEligible: true, reviewScore: 79,
  },
  {
    make: "Suzuki", model: "Jimny", variant: "GLX", year: 2023,
    price: 33990, driveawayPrice: 35600, priceIndicator: "HIGH",
    odometer: 12000, transmission: "Manual", fuel: "Petrol", bodyType: "SUV",
    driveType: "4x4", doors: 3, seats: 4, colour: "Kinetic Yellow", engine: "1.5L 4cyl",
    cylinders: 4, powerKw: 75, condition: "USED", sellerType: "PRIVATE", sellerName: "Ella",
    suburb: "Byron Bay", state: "NSW",
    description:
      "Characterful Jimny GLX 5-speed manual — tiny but genuinely capable off-road with low range. Hugely popular and holds its value. A few aftermarket touches.",
    features: ["Low-range 4WD", "5-speed manual", "Brake LSD traction control", "Apple CarPlay", "All-terrain tyres"],
    tradeInEligible: false, reviewScore: 72,
  },
];

async function main() {
  console.log("Seeding listings…");
  await prisma.listing.deleteMany();

  await Promise.all(
    rows.map((r, i) => {
      const { _imgCount, ...rest } = r;
      const title = `${r.year} ${r.make} ${r.model}${r.variant ? ` ${r.variant}` : ""}`;
      const slug = slugify(`${title}-${r.suburb}-${i + 1}`);
      return prisma.listing.create({
        data: { ...rest, slug, images: img(i, _imgCount ?? 5) },
      });
    })
  );

  const count = await prisma.listing.count();
  console.log(`✓ Seeded ${count} listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
