export interface RegColumnDto {
  _id: string;
  title: string;
  icon: string;
  order: number;
}

export interface RegCardDto {
  _id: string;
  columnId: string;
  title: string;
  link: string;
  order: number;
}

export interface RegBoardDto {
  columns: RegColumnDto[];
  cards: RegCardDto[];
}
