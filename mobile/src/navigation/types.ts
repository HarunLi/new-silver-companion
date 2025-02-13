export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Health: undefined;
  Activities: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  PetDetail: { id: number };
  GuideDetail: { id: number };
};

export type HealthStackParamList = {
  HealthScreen: undefined;
  HealthRecord: undefined;
  HealthHistory: undefined;
  DiseaseManagement: undefined;
};

export type ActivitiesStackParamList = {
  ActivitiesList: undefined;
  ActivityDetail: { id: number };
  CreateActivity: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  About: undefined;
};
