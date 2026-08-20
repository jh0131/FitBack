export interface ClosetItem {
  id: string;
  label: string;
  imageUrl: string;
}

export const CLOSET_DUMMY_ITEMS: ClosetItem[] = [
  {
    id: 'c1',
    label: '베이지 트렌치코트',
    imageUrl: 'https://picsum.photos/seed/closet1/300/400',
  },
  {
    id: 'c2',
    label: '화이트 셔츠',
    imageUrl: 'https://picsum.photos/seed/closet2/300/400',
  },
  {
    id: 'c3',
    label: '블랙 슬랙스',
    imageUrl: 'https://picsum.photos/seed/closet3/300/400',
  },
  {
    id: 'c4',
    label: '니트 가디건',
    imageUrl: 'https://picsum.photos/seed/closet4/300/400',
  },
];

export const RECENT_TAGS_DUMMY = ['미니멀', '캐주얼', '오피스룩', '스트릿'];

// 업로드 선택 시트에서 "선택"을 눌렀을 때 대신 채워 넣을 더미 이미지
export const DUMMY_UPLOAD_IMAGE_URL =
  'https://picsum.photos/seed/fitback-upload/800/1000';
