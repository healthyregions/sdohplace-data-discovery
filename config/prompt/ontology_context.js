export const HERO_LAB_ONTOLOGY_NAME = "HeroP Lab's Suggested SDOH Ontology";

export const ontologyContext = `=== GLOBAL MODE ===
# SDOH Domain Knowledge Context
The following is a controlled vocabulary for Social Determinants of Health (SDOH) data discovery.
Use these concepts to interpret the user's query and identify relevant datasets.

## Top-level concept branches:
- demographics
  - age-dynamics
  - disability-dynamics
  - gender-and-sexuality-dynamics
  - household-dynamics
  - racial-and-ethnic-dynamics
- economic-stability
  - household-income
  - income-inequality
  - poverty
- education: Acquisition of knowledge as a result of instruction in a formal course of study.
  - educational-attainment
- employment
  - jobs-per-capita
  - unemployment
- food-environment (also: foodscape, neighborhood-food-environment): The food environment is the community-level physical, economic, political, and sociocultural conditions that impact the
  - digital-food-environment
  - food-access
  - food-insecurity
  - food-policy
  - food-resources
  - food-security
  - healthy-food-environment
  - nutrition-disorders
  - nutrition-environment
- health-and-healthcare
  - insurance-access
  - medication-access
  - pharmacy-access
  - provider-access
- housing: A dwelling which is considered to be long-term, permanent, or semi-permanent in nature.
  - crowded-housing
  - housing-cost-burden
  - housing-discrimination (also: discrimination-in-housing)
  - housing-instability
  - housing-quality (also: housing-condition)
  - housing-type
  - inadequate-housing (also: housing-inadequacy)
  - insecure-housing (also: housing-insecurity)
  - renter
- neighborhood-and-built-environment
  - neighborhood-characteristics
  - social-space
- physical-activity-and-lifestyle
  - group-exercise
  - group-recreation
  - life-style
  - recreation-area-access
- safety
  - structural-racism
  - violent-crime
- social-and-community-context
  - social-cohesion
  - social-interaction
  - social-isolation
  - social-relation
  - social-segregation
  - voter-participation
- transportation-and-infrastructure
  - public-transit-access

[chars: 2002]


=== SCOPED MODE: food-environment ===
# SDOH Domain Knowledge Context
The following is a controlled vocabulary for Social Determinants of Health (SDOH) data discovery.
Use these concepts to interpret the user's query and identify relevant datasets.

## Concepts in branch: food-environment
- food-environment (also: foodscape, neighborhood-food-environment): The food environment is the community-level physical, economic, political, and sociocultural conditions that impact the
  - digital-food-environment: Augmentation of the food environment via digital technological that impacts food acquisition and consumption.
    - online-food-delivery: "online platforms that link consumers to food available for delivery or pickup within their geographic area"
  - food-access: the ability to acquire food
    - food-acceptability
    - food-accomodation
    - food-affordability: food prices and people's perceptions of worth relative to the cost
    - food-availability: The supply or presence of food
    - food-diversity
  - food-insecurity: Limited or uncertain availability of nutritionally adequate and safe foods or limited or uncertain ability to acquire ac
    - food-deserts: Areas characterized by relatively poor access to healthy and affordable food.
    - food-mirage: An area in which residents have geographic access to food sources but lack the economic or cultural means to take advant
    - food-swamp
  - food-policy: Policies, regulations, programs, and institutional actions that govern food systems and food-related conditions within c
    - food-assistance: Food or financial assistance for food given to those in need.
    - nutrition-policy: Guidelines and objectives pertaining to food supply and nutrition including recommendations for healthy diet.
    - school-food-policy: Policies, programs, and institutional rules that govern food provision, meal standards, and food-related practices in sc
  - food-resources
    - community-food-resources
    - food-retail-environment (also: retail-food-environment): presence, density, and quality of locations where food can be bought
    - home-food-environment: Conditions that affect how a person acquires and consumes food in and around the home
    - school-food-environment: the spaces and conditions inside and around schools where food is available, obtained, or consumed
    - university-food-environment: conditions in and around university settings that impact food availability, acquisition, and consumption
  - food-security: The presence of low-cost, physically accessible healthy food options in a community
  - healthy-food-environment: A neighborhood or locale that provides access to healthy foods and healthy eating alternatives.
    - access-to-fresh-foods
    - access-to-healthy-foods
    - fresh food: Fresh food is food that has not been subjected to food preservation processes (including freezing) that alter its harves
  - nutrition-disorders
    - health-outcomes
    - hunger: hunger is the craving for food.
    - malnourishment
    - malnutrition: Inadequate nutrition resulting from poor diet, malabsorption, or abnormal nutrient distribution
    - overnutrition
    - undernutrition
  - nutrition-environment
    - diet
    - dietary-supplement
    - nutrition (also: nutritional-physiological-phenomena): The processes and properties of living organisms by which they take in and balance the use of nutritive materials for en
    - nutritional-status: The state of the body as influenced by the diet and the ability of the diet to maintain an overall healthy condition
    - ultra-processed food

[chars: 3559]`;

export const HERO_SDOH_ONTOLOGY = [
  {
    "id": "demographics",
    "label": "demographics",
    "path": [
      "demographics"
    ]
  },
  {
    "id": "age-dynamics",
    "label": "age-dynamics",
    "path": [
      "demographics",
      "age-dynamics"
    ]
  },
  {
    "id": "children",
    "label": "children",
    "path": [
      "demographics",
      "age-dynamics",
      "children"
    ]
  },
  {
    "id": "senior",
    "label": "senior",
    "path": [
      "demographics",
      "age-dynamics",
      "senior"
    ]
  },
  {
    "id": "disability-dynamics",
    "label": "disability-dynamics",
    "path": [
      "demographics",
      "disability-dynamics"
    ]
  },
  {
    "id": "gender-and-sexuality-dynamics",
    "label": "gender-and-sexuality-dynamics",
    "path": [
      "demographics",
      "gender-and-sexuality-dynamics"
    ]
  },
  {
    "id": "household-dynamics",
    "label": "household-dynamics",
    "path": [
      "demographics",
      "household-dynamics"
    ]
  },
  {
    "id": "single-parent-householder",
    "label": "single-parent-householder",
    "path": [
      "demographics",
      "household-dynamics",
      "single-parent-householder"
    ]
  },
  {
    "id": "racial-and-ethnic-dynamics",
    "label": "racial-and-ethnic-dynamics",
    "path": [
      "demographics",
      "racial-and-ethnic-dynamics"
    ]
  },
  {
    "id": "economic-stability",
    "label": "economic-stability",
    "path": [
      "economic-stability"
    ]
  },
  {
    "id": "household-income",
    "label": "household-income",
    "path": [
      "economic-stability",
      "household-income"
    ]
  },
  {
    "id": "income-inequality",
    "label": "income-inequality",
    "path": [
      "economic-stability",
      "income-inequality"
    ]
  },
  {
    "id": "poverty",
    "label": "poverty",
    "path": [
      "economic-stability",
      "poverty"
    ]
  },
  {
    "id": "child-poverty",
    "label": "child-poverty",
    "path": [
      "economic-stability",
      "poverty",
      "child-poverty"
    ],
    "triggers": [
      "child poverty",
      "children poverty",
      "poverty among children",
      "poverty rates among children",
      "poverty rates in households with children",
      "poverty in households with children"
    ]
  },
  {
    "id": "household-poverty",
    "label": "household-poverty",
    "path": [
      "economic-stability",
      "poverty",
      "household-poverty"
    ],
    "triggers": [
      "household poverty",
      "households poverty",
      "poverty rates in households",
      "poverty in households",
      "low-income households"
    ]
  },
  {
    "id": "education",
    "label": "education",
    "path": [
      "education"
    ]
  },
  {
    "id": "educational-attainment",
    "label": "educational-attainment",
    "path": [
      "education",
      "educational-attainment"
    ]
  },
  {
    "id": "highschool-graduation",
    "label": "highschool-graduation",
    "path": [
      "education",
      "educational-attainment",
      "highschool-graduation"
    ]
  },
  {
    "id": "some-college",
    "label": "some-college",
    "path": [
      "education",
      "educational-attainment",
      "some-college"
    ]
  },
  {
    "id": "employment",
    "label": "employment",
    "path": [
      "employment"
    ]
  },
  {
    "id": "jobs-per-capita",
    "label": "jobs-per-capita",
    "path": [
      "employment",
      "jobs-per-capita"
    ]
  },
  {
    "id": "unemployment",
    "label": "unemployment",
    "path": [
      "employment",
      "unemployment"
    ]
  },
  {
    "id": "food-environment",
    "label": "food-environment",
    "path": [
      "food-environment"
    ],
    "ontologyAliases": [
      "foodscape",
      "neighborhood-food-environment"
    ]
  },
  {
    "id": "digital-food-environment",
    "label": "digital-food-environment",
    "path": [
      "food-environment",
      "digital-food-environment"
    ]
  },
  {
    "id": "online-food-delivery",
    "label": "online-food-delivery",
    "path": [
      "food-environment",
      "digital-food-environment",
      "online-food-delivery"
    ]
  },
  {
    "id": "food-access",
    "label": "food-access",
    "path": [
      "food-environment",
      "food-access"
    ],
    "triggers": [
      "access to food",
      "food access"
    ]
  },
  {
    "id": "food-acceptability",
    "label": "food-acceptability",
    "path": [
      "food-environment",
      "food-access",
      "food-acceptability"
    ]
  },
  {
    "id": "culturally-appropriate-foods",
    "label": "culturally-appropriate-foods",
    "path": [
      "food-environment",
      "food-access",
      "food-acceptability",
      "culturally-appropriate-foods"
    ]
  },
  {
    "id": "culturally-sensitive-foods",
    "label": "culturally-sensitive-foods",
    "path": [
      "food-environment",
      "food-access",
      "food-acceptability",
      "culturally-sensitive-foods"
    ]
  },
  {
    "id": "food-quality",
    "label": "food-quality",
    "path": [
      "food-environment",
      "food-access",
      "food-acceptability",
      "food-quality"
    ]
  },
  {
    "id": "food-safety",
    "label": "food-safety",
    "path": [
      "food-environment",
      "food-access",
      "food-acceptability",
      "food-safety"
    ]
  },
  {
    "id": "traditional-diet-cultures",
    "label": "traditional-diet-cultures",
    "path": [
      "food-environment",
      "food-access",
      "food-acceptability",
      "traditional-diet-cultures"
    ]
  },
  {
    "id": "food-accomodation",
    "label": "food-accomodation",
    "path": [
      "food-environment",
      "food-access",
      "food-accomodation"
    ]
  },
  {
    "id": "food-affordability",
    "label": "food-affordability",
    "path": [
      "food-environment",
      "food-access",
      "food-affordability"
    ],
    "triggers": [
      "food prices",
      "affordable food"
    ]
  },
  {
    "id": "food-budget",
    "label": "food-budget",
    "path": [
      "food-environment",
      "food-access",
      "food-affordability",
      "food-budget"
    ]
  },
  {
    "id": "food-price",
    "label": "food-price",
    "path": [
      "food-environment",
      "food-access",
      "food-affordability",
      "food-price"
    ],
    "ontologyAliases": [
      "food-cost",
      "food-prices"
    ]
  },
  {
    "id": "food-availability",
    "label": "food-availability",
    "path": [
      "food-environment",
      "food-access",
      "food-availability"
    ],
    "triggers": [
      "availability of food",
      "presence of food",
      "supply of food",
      "lack grocery",
      "lack grocery stores",
      "lacking grocery stores",
      "neighborhoods that lack grocery stores",
      "grocery stores selling fresh produce"
    ]
  },
  {
    "id": "food-spatial-availability",
    "label": "food-spatial-availability",
    "path": [
      "food-environment",
      "food-access",
      "food-availability",
      "food-spatial-availability"
    ]
  },
  {
    "id": "food-temporal-availability",
    "label": "food-temporal-availability",
    "path": [
      "food-environment",
      "food-access",
      "food-availability",
      "food-temporal-availability"
    ]
  },
  {
    "id": "food-diversity",
    "label": "food-diversity",
    "path": [
      "food-environment",
      "food-access",
      "food-diversity"
    ]
  },
  {
    "id": "dietary-diversity",
    "label": "dietary-diversity",
    "path": [
      "food-environment",
      "food-access",
      "food-diversity",
      "dietary-diversity"
    ]
  },
  {
    "id": "food-choice",
    "label": "food-choice",
    "path": [
      "food-environment",
      "food-access",
      "food-diversity",
      "food-choice"
    ]
  },
  {
    "id": "food-variety",
    "label": "food-variety",
    "path": [
      "food-environment",
      "food-access",
      "food-diversity",
      "food-variety"
    ]
  },
  {
    "id": "food-insecurity",
    "label": "food-insecurity",
    "path": [
      "food-environment",
      "food-insecurity"
    ],
    "triggers": [
      "limited or uncertain availability",
      "uncertain availability of food"
    ]
  },
  {
    "id": "food-deserts",
    "label": "food-deserts",
    "path": [
      "food-environment",
      "food-insecurity",
      "food-deserts"
    ],
    "triggers": [
      "food desert",
      "food deserts"
    ]
  },
  {
    "id": "food-mirage",
    "label": "food-mirage",
    "path": [
      "food-environment",
      "food-insecurity",
      "food-mirage"
    ]
  },
  {
    "id": "food-swamp",
    "label": "food-swamp",
    "path": [
      "food-environment",
      "food-insecurity",
      "food-swamp"
    ]
  },
  {
    "id": "food-policy",
    "label": "food-policy",
    "path": [
      "food-environment",
      "food-policy"
    ]
  },
  {
    "id": "food-assistance",
    "label": "food-assistance",
    "path": [
      "food-environment",
      "food-policy",
      "food-assistance"
    ]
  },
  {
    "id": "WIC",
    "label": "WIC",
    "path": [
      "food-environment",
      "food-policy",
      "food-assistance",
      "WIC"
    ]
  },
  {
    "id": "nutrition-policy",
    "label": "nutrition-policy",
    "path": [
      "food-environment",
      "food-policy",
      "nutrition-policy"
    ]
  },
  {
    "id": "school-food-policy",
    "label": "school-food-policy",
    "path": [
      "food-environment",
      "food-policy",
      "school-food-policy"
    ]
  },
  {
    "id": "NSLP",
    "label": "NSLP",
    "path": [
      "food-environment",
      "food-policy",
      "school-food-policy",
      "NSLP"
    ]
  },
  {
    "id": "food-resources",
    "label": "food-resources",
    "path": [
      "food-environment",
      "food-resources"
    ]
  },
  {
    "id": "community-food-resources",
    "label": "community-food-resources",
    "path": [
      "food-environment",
      "food-resources",
      "community-food-resources"
    ]
  },
  {
    "id": "food-bank",
    "label": "food-bank",
    "path": [
      "food-environment",
      "food-resources",
      "community-food-resources",
      "food-bank"
    ]
  },
  {
    "id": "food-pantry",
    "label": "food-pantry",
    "path": [
      "food-environment",
      "food-resources",
      "community-food-resources",
      "food-pantry"
    ]
  },
  {
    "id": "soup-kitchen",
    "label": "soup-kitchen",
    "path": [
      "food-environment",
      "food-resources",
      "community-food-resources",
      "soup-kitchen"
    ]
  },
  {
    "id": "food-retail-environment",
    "label": "food-retail-environment",
    "path": [
      "food-environment",
      "food-resources",
      "food-retail-environment"
    ],
    "ontologyAliases": [
      "retail-food-environment"
    ]
  },
  {
    "id": "food-marketing",
    "label": "food-marketing",
    "path": [
      "food-environment",
      "food-resources",
      "food-retail-environment",
      "food-marketing"
    ],
    "ontologyAliases": [
      "food-advertising"
    ]
  },
  {
    "id": "food-retail",
    "label": "food-retail",
    "path": [
      "food-environment",
      "food-resources",
      "food-retail-environment",
      "food-retail"
    ]
  },
  {
    "id": "convenience-stores",
    "label": "convenience-stores",
    "path": [
      "food-environment",
      "food-resources",
      "food-retail-environment",
      "food-retail",
      "convenience-stores"
    ]
  },
  {
    "id": "farmers-markets",
    "label": "farmers-markets",
    "path": [
      "food-environment",
      "food-resources",
      "food-retail-environment",
      "food-retail",
      "farmers-markets"
    ]
  },
  {
    "id": "urban-and-peri-urban-agriculture",
    "label": "urban-and-peri-urban-agriculture",
    "path": [
      "food-environment",
      "food-resources",
      "food-retail-environment",
      "food-retail",
      "farmers-markets",
      "urban-and-peri-urban-agriculture"
    ]
  },
  {
    "id": "grocery-store",
    "label": "grocery-store",
    "path": [
      "food-environment",
      "food-resources",
      "food-retail-environment",
      "food-retail",
      "grocery-store"
    ]
  },
  {
    "id": "supermarket",
    "label": "supermarket",
    "path": [
      "food-environment",
      "food-resources",
      "food-retail-environment",
      "food-retail",
      "supermarket"
    ]
  },
  {
    "id": "home-food-environment",
    "label": "home-food-environment",
    "path": [
      "food-environment",
      "food-resources",
      "home-food-environment"
    ]
  },
  {
    "id": "home-food-availability",
    "label": "home-food-availability",
    "path": [
      "food-environment",
      "food-resources",
      "home-food-environment",
      "home-food-availability"
    ]
  },
  {
    "id": "school-food-environment",
    "label": "school-food-environment",
    "path": [
      "food-environment",
      "food-resources",
      "school-food-environment"
    ]
  },
  {
    "id": "university-food-environment",
    "label": "university-food-environment",
    "path": [
      "food-environment",
      "food-resources",
      "university-food-environment"
    ]
  },
  {
    "id": "food-security",
    "label": "food-security",
    "path": [
      "food-environment",
      "food-security"
    ]
  },
  {
    "id": "healthy-food-environment",
    "label": "healthy-food-environment",
    "path": [
      "food-environment",
      "healthy-food-environment"
    ],
    "triggers": [
      "healthy food environment"
    ]
  },
  {
    "id": "access-to-fresh-foods",
    "label": "access-to-fresh-foods",
    "path": [
      "food-environment",
      "healthy-food-environment",
      "access-to-fresh-foods"
    ],
    "triggers": [
      "access to fresh foods",
      "fresh food access",
      "fresh foods",
      "fresh food"
    ]
  },
  {
    "id": "access-to-healthy-foods",
    "label": "access-to-healthy-foods",
    "path": [
      "food-environment",
      "healthy-food-environment",
      "access-to-healthy-foods"
    ],
    "triggers": [
      "access to healthy foods",
      "healthy food access",
      "healthy foods"
    ]
  },
  {
    "id": "fresh food",
    "label": "fresh food",
    "path": [
      "food-environment",
      "healthy-food-environment",
      "fresh food"
    ]
  },
  {
    "id": "nutrition-disorders",
    "label": "nutrition-disorders",
    "path": [
      "food-environment",
      "nutrition-disorders"
    ]
  },
  {
    "id": "health-outcomes",
    "label": "health-outcomes",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes"
    ]
  },
  {
    "id": "body-weight",
    "label": "body-weight",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "body-weight"
    ]
  },
  {
    "id": "overweight",
    "label": "overweight",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "body-weight",
      "overweight"
    ]
  },
  {
    "id": "weight-gain",
    "label": "weight-gain",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "body-weight",
      "weight-gain"
    ]
  },
  {
    "id": "cardiovascular-diseases",
    "label": "cardiovascular-diseases",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "cardiovascular-diseases"
    ]
  },
  {
    "id": "chronic-disease",
    "label": "chronic-disease",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "chronic-disease"
    ]
  },
  {
    "id": "obesity",
    "label": "obesity",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "chronic-disease",
      "obesity"
    ]
  },
  {
    "id": "childhood-obesity",
    "label": "childhood-obesity",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "chronic-disease",
      "obesity",
      "childhood-obesity"
    ]
  },
  {
    "id": "health",
    "label": "health",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "health"
    ]
  },
  {
    "id": "health-disparities",
    "label": "health-disparities",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "health",
      "health-disparities"
    ]
  },
  {
    "id": "health-equity",
    "label": "health-equity",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "health",
      "health-equity"
    ]
  },
  {
    "id": "premature-birth",
    "label": "premature-birth",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "premature-birth"
    ]
  },
  {
    "id": "preterm-birth",
    "label": "preterm-birth",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "health-outcomes",
      "premature-birth",
      "preterm-birth"
    ]
  },
  {
    "id": "hunger",
    "label": "hunger",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "hunger"
    ]
  },
  {
    "id": "malnourishment",
    "label": "malnourishment",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "malnourishment"
    ]
  },
  {
    "id": "malnutrition",
    "label": "malnutrition",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "malnutrition"
    ]
  },
  {
    "id": "overnutrition",
    "label": "overnutrition",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "overnutrition"
    ]
  },
  {
    "id": "undernutrition",
    "label": "undernutrition",
    "path": [
      "food-environment",
      "nutrition-disorders",
      "undernutrition"
    ]
  },
  {
    "id": "nutrition-environment",
    "label": "nutrition-environment",
    "path": [
      "food-environment",
      "nutrition-environment"
    ]
  },
  {
    "id": "diet",
    "label": "diet",
    "path": [
      "food-environment",
      "nutrition-environment",
      "diet"
    ]
  },
  {
    "id": "dietary-supplement",
    "label": "dietary-supplement",
    "path": [
      "food-environment",
      "nutrition-environment",
      "dietary-supplement"
    ]
  },
  {
    "id": "nutrition",
    "label": "nutrition",
    "path": [
      "food-environment",
      "nutrition-environment",
      "nutrition"
    ],
    "ontologyAliases": [
      "nutritional-physiological-phenomena"
    ]
  },
  {
    "id": "nutritional-status",
    "label": "nutritional-status",
    "path": [
      "food-environment",
      "nutrition-environment",
      "nutritional-status"
    ]
  },
  {
    "id": "ultra-processed food",
    "label": "ultra-processed food",
    "path": [
      "food-environment",
      "nutrition-environment",
      "ultra-processed food"
    ]
  },
  {
    "id": "health-and-healthcare",
    "label": "health-and-healthcare",
    "path": [
      "health-and-healthcare"
    ]
  },
  {
    "id": "insurance-access",
    "label": "insurance-access",
    "path": [
      "health-and-healthcare",
      "insurance-access"
    ]
  },
  {
    "id": "medication-access",
    "label": "medication-access",
    "path": [
      "health-and-healthcare",
      "medication-access"
    ]
  },
  {
    "id": "moud-access",
    "label": "moud-access",
    "path": [
      "health-and-healthcare",
      "medication-access",
      "moud-access"
    ]
  },
  {
    "id": "pharmacy-access",
    "label": "pharmacy-access",
    "path": [
      "health-and-healthcare",
      "pharmacy-access"
    ]
  },
  {
    "id": "provider-access",
    "label": "provider-access",
    "path": [
      "health-and-healthcare",
      "provider-access"
    ]
  },
  {
    "id": "fqhc-access",
    "label": "fqhc-access",
    "path": [
      "health-and-healthcare",
      "provider-access",
      "fqhc-access"
    ]
  },
  {
    "id": "primary-care-provider-access",
    "label": "primary-care-provider-access",
    "path": [
      "health-and-healthcare",
      "provider-access",
      "primary-care-provider-access"
    ]
  },
  {
    "id": "specialty-provider-access",
    "label": "specialty-provider-access",
    "path": [
      "health-and-healthcare",
      "provider-access",
      "specialty-provider-access"
    ]
  },
  {
    "id": "housing",
    "label": "housing",
    "path": [
      "housing"
    ]
  },
  {
    "id": "crowded-housing",
    "label": "crowded-housing",
    "path": [
      "housing",
      "crowded-housing"
    ]
  },
  {
    "id": "housing-cost-burden",
    "label": "housing-cost-burden",
    "path": [
      "housing",
      "housing-cost-burden"
    ]
  },
  {
    "id": "housing-discrimination",
    "label": "housing-discrimination",
    "path": [
      "housing",
      "housing-discrimination"
    ],
    "ontologyAliases": [
      "discrimination-in-housing"
    ]
  },
  {
    "id": "redlining",
    "label": "redlining",
    "path": [
      "housing",
      "housing-discrimination",
      "redlining"
    ]
  },
  {
    "id": "housing-instability",
    "label": "housing-instability",
    "path": [
      "housing",
      "housing-instability"
    ],
    "triggers": [
      "housing stability",
      "housing instability",
      "stable housing",
      "unstable housing"
    ]
  },
  {
    "id": "eviction",
    "label": "eviction",
    "path": [
      "housing",
      "housing-instability",
      "eviction"
    ]
  },
  {
    "id": "housing-quality",
    "label": "housing-quality",
    "path": [
      "housing",
      "housing-quality"
    ],
    "ontologyAliases": [
      "housing-condition"
    ]
  },
  {
    "id": "housing-type",
    "label": "housing-type",
    "path": [
      "housing",
      "housing-type"
    ]
  },
  {
    "id": "housing-for-the-elderly",
    "label": "housing-for-the-elderly",
    "path": [
      "housing",
      "housing-type",
      "housing-for-the-elderly"
    ],
    "ontologyAliases": [
      "continuing-care-retirement-centers"
    ]
  },
  {
    "id": "public-housing",
    "label": "public-housing",
    "path": [
      "housing",
      "housing-type",
      "public-housing"
    ]
  },
  {
    "id": "inadequate-housing",
    "label": "inadequate-housing",
    "path": [
      "housing",
      "inadequate-housing"
    ],
    "ontologyAliases": [
      "housing-inadequacy"
    ]
  },
  {
    "id": "insecure-housing",
    "label": "insecure-housing",
    "path": [
      "housing",
      "insecure-housing"
    ],
    "ontologyAliases": [
      "housing-insecurity"
    ]
  },
  {
    "id": "renter",
    "label": "renter",
    "path": [
      "housing",
      "renter"
    ]
  },
  {
    "id": "neighborhood-and-built-environment",
    "label": "neighborhood-and-built-environment",
    "path": [
      "neighborhood-and-built-environment"
    ]
  },
  {
    "id": "neighborhood-characteristics",
    "label": "neighborhood-characteristics",
    "path": [
      "neighborhood-and-built-environment",
      "neighborhood-characteristics"
    ],
    "triggers": [
      "neighborhood characteristics"
    ]
  },
  {
    "id": "social-space",
    "label": "social-space",
    "path": [
      "neighborhood-and-built-environment",
      "social-space"
    ]
  },
  {
    "id": "physical-activity-and-lifestyle",
    "label": "physical-activity-and-lifestyle",
    "path": [
      "physical-activity-and-lifestyle"
    ]
  },
  {
    "id": "group-exercise",
    "label": "group-exercise",
    "path": [
      "physical-activity-and-lifestyle",
      "group-exercise"
    ]
  },
  {
    "id": "group-recreation",
    "label": "group-recreation",
    "path": [
      "physical-activity-and-lifestyle",
      "group-recreation"
    ]
  },
  {
    "id": "life-style",
    "label": "life-style",
    "path": [
      "physical-activity-and-lifestyle",
      "life-style"
    ]
  },
  {
    "id": "healthy-lifestyle-environment",
    "label": "healthy-lifestyle-environment",
    "path": [
      "physical-activity-and-lifestyle",
      "life-style",
      "healthy-lifestyle-environment"
    ]
  },
  {
    "id": "recreation-area-access",
    "label": "recreation-area-access",
    "path": [
      "physical-activity-and-lifestyle",
      "recreation-area-access"
    ]
  },
  {
    "id": "safety",
    "label": "safety",
    "path": [
      "safety"
    ]
  },
  {
    "id": "structural-racism",
    "label": "structural-racism",
    "path": [
      "safety",
      "structural-racism"
    ]
  },
  {
    "id": "violent-crime",
    "label": "violent-crime",
    "path": [
      "safety",
      "violent-crime"
    ]
  },
  {
    "id": "social-and-community-context",
    "label": "social-and-community-context",
    "path": [
      "social-and-community-context"
    ]
  },
  {
    "id": "social-cohesion",
    "label": "social-cohesion",
    "path": [
      "social-and-community-context",
      "social-cohesion"
    ]
  },
  {
    "id": "social-interaction",
    "label": "social-interaction",
    "path": [
      "social-and-community-context",
      "social-interaction"
    ]
  },
  {
    "id": "social-isolation",
    "label": "social-isolation",
    "path": [
      "social-and-community-context",
      "social-isolation"
    ]
  },
  {
    "id": "social-relation",
    "label": "social-relation",
    "path": [
      "social-and-community-context",
      "social-relation"
    ]
  },
  {
    "id": "social-segregation",
    "label": "social-segregation",
    "path": [
      "social-and-community-context",
      "social-segregation"
    ]
  },
  {
    "id": "voter-participation",
    "label": "voter-participation",
    "path": [
      "social-and-community-context",
      "voter-participation"
    ]
  },
  {
    "id": "transportation-and-infrastructure",
    "label": "transportation-and-infrastructure",
    "path": [
      "transportation-and-infrastructure"
    ]
  },
  {
    "id": "public-transit-access",
    "label": "public-transit-access",
    "path": [
      "transportation-and-infrastructure",
      "public-transit-access"
    ]
  }
];
