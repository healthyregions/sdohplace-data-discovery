import {
  PeopleOutline,
  PaidOutlined,
  WorkOutline,
  SchoolOutlined,
  LocalHospitalOutlined,
  HomeOutlined,
  ParkOutlined,
  LocationCityOutlined,
  DirectionsBikeOutlined,
  SecurityOutlined,
  ForumOutlined,
  DirectionsBusOutlined,
  AutoAwesomeMosaicOutlined,
  ShoppingCartOutlined,
} from "@mui/icons-material";

/**
 * @param icon is the icon name based on SolrObject theme(?)
 * @returns the Material UI icon component corresponding to the icon name
 */
const IconMatch = (icon: string): JSX.Element => {
  const normalizedIcon = icon
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ");
  const iconMap: Record<string, JSX.Element> = {
    demographics: <PeopleOutline />,
    "economic stability": <PaidOutlined />,
    employment: <WorkOutline />,
    education: <SchoolOutlined />,
    "food environment": <ShoppingCartOutlined />,
    "health and healthcare": <LocalHospitalOutlined />,
    "health and health care": <LocalHospitalOutlined />,
    housing: <HomeOutlined />,
    "natural environment": <ParkOutlined />,
    "neighborhood and built environment": <LocationCityOutlined />,
    "physical activity and lifestyle": <DirectionsBikeOutlined />,
    safety: <SecurityOutlined />,
    "social and community context": <ForumOutlined />,
    "transportation and infrastructure": <DirectionsBusOutlined />,
    "composite index": <AutoAwesomeMosaicOutlined />,
  };

  return iconMap[normalizedIcon] ?? <AutoAwesomeMosaicOutlined />;
};

export default IconMatch;
