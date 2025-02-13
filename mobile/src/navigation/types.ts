export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Activities: undefined;
  Tips: undefined;
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

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
