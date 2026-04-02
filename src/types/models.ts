export type Slide = {
  id: string;
  uri: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  slides: Slide[];
};
