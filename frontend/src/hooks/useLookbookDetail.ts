import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLookbookDetail,
  likeLookbook,
  unlikeLookbook,
  saveLookbook,
  unsaveLookbook,
  reportLookbook,
  deleteLookbook,
  getLookbookFeed,
  type LookbookDetail,
  type ReportType,
} from '../api/lookbooks';

const detailKey = (id: number) => ['lookbookDetail', id];

// 좋아요 상태를 들고 있는 화면이 상세 하나가 아니다 — 홈/트렌드 피드('lookbookFeed'
// 접두사)와 검색 결과('contentSearch')도 같은 룩북을 목록 형태로 보여준다. 상세
// 캐시만 갱신하면 피드/검색 썸네일의 하트는 그대로 남아있다가 상세로 들어가야만
// (새로 fetch되면서) 바뀌어 보이는 문제가 있었음 — 목록 캐시들도 같이 패치한다.
type LikeLike = { isLiked: boolean; likeCount: number };

// 목록 아이템은 저마다 자기 likeCount를 들고 있어서, 상세 캐시에서 가져온 절대값을
// 그대로 덮어쓰면(상세를 아직 안 열어봤다면 그 값 자체가 부정확) 엉뚱한 숫자가 될 수
// 있다 — optimistic 단계에서는 각 아이템 자신의 값 기준으로 ±1만 조정한다.
function patchLikeInListItem<T extends LikeLike>(
  item: T,
  targetId: number,
  isLiked: boolean,
  delta: number,
): T {
  const itemId = (item as unknown as { id?: number; lookbookId?: number }).id
    ?? (item as unknown as { lookbookId?: number }).lookbookId;
  if (itemId !== targetId) return item;
  return { ...item, isLiked, likeCount: Math.max(0, item.likeCount + delta) };
}

function patchLikeAcrossListCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  lookbookId: number,
  isLiked: boolean,
  delta: number,
) {
  // 홈/트렌드 피드: { items: LookbookFeedItem[]; hasNext; nextCursor }
  queryClient.setQueriesData<{ items: LikeLike[] } | undefined>(
    { queryKey: ['lookbookFeed'] },
    (old) =>
      old
        ? { ...old, items: old.items.map((item) => patchLikeInListItem(item, lookbookId, isLiked, delta)) }
        : old,
  );
  // 통합 검색: { trends; lookbooks: LookbookSearchItem[] }
  queryClient.setQueriesData<{ lookbooks: LikeLike[] } | undefined>(
    { queryKey: ['contentSearch'] },
    (old) =>
      old
        ? { ...old, lookbooks: old.lookbooks.map((item) => patchLikeInListItem(item, lookbookId, isLiked, delta)) }
        : old,
  );
}

// onSuccess/onError에서는 서버가 내려준(혹은 롤백할) 절대값이 진짜 정답이므로
// 모든 캐시에 그대로 덮어써도 안전하다.
function overwriteLikeAcrossListCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  lookbookId: number,
  patch: LikeLike,
) {
  queryClient.setQueriesData<{ items: LikeLike[] } | undefined>(
    { queryKey: ['lookbookFeed'] },
    (old) =>
      old
        ? {
            ...old,
            items: old.items.map((item) =>
              ((item as unknown as { id?: number }).id ?? (item as unknown as { lookbookId?: number }).lookbookId) === lookbookId
                ? { ...item, ...patch }
                : item,
            ),
          }
        : old,
  );
  queryClient.setQueriesData<{ lookbooks: LikeLike[] } | undefined>(
    { queryKey: ['contentSearch'] },
    (old) =>
      old
        ? {
            ...old,
            lookbooks: old.lookbooks.map((item) =>
              ((item as unknown as { id?: number }).id ?? (item as unknown as { lookbookId?: number }).lookbookId) === lookbookId
                ? { ...item, ...patch }
                : item,
            ),
          }
        : old,
  );
}

export const useLookbookDetail = (lookbookId: number) =>
  useQuery({
    queryKey: detailKey(lookbookId),
    queryFn: () => getLookbookDetail(lookbookId),
  });

export const useToggleLike = (lookbookId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    // isLiked는 실제 API가 좋아요/좋아요 취소를 서로 다른 엔드포인트(POST/DELETE)로
    // 나눠놓았기 때문에, 호출 시점의 현재 상태를 보고 어느 쪽을 부를지 결정한다.
    mutationFn: (currentlyLiked: boolean) =>
      currentlyLiked ? unlikeLookbook(lookbookId) : likeLookbook(lookbookId),
    onMutate: async (currentlyLiked) => {
      await queryClient.cancelQueries({ queryKey: detailKey(lookbookId) });
      const previous = queryClient.getQueryData<LookbookDetail>(
        detailKey(lookbookId),
      );
      const optimisticPatch: LikeLike = {
        isLiked: !currentlyLiked,
        likeCount: currentlyLiked
          ? (previous?.likeCount ?? 1) - 1
          : (previous?.likeCount ?? 0) + 1,
      };
      queryClient.setQueryData<LookbookDetail>(detailKey(lookbookId), (old) =>
        old ? { ...old, ...optimisticPatch } : old,
      );
      patchLikeAcrossListCaches(queryClient, lookbookId, !currentlyLiked, currentlyLiked ? -1 : 1);
      return { previous };
    },
    onSuccess: (result) => {
      queryClient.setQueryData<LookbookDetail>(detailKey(lookbookId), (old) =>
        old
          ? { ...old, isLiked: result.isLiked, likeCount: result.likeCount }
          : old,
      );
      overwriteLikeAcrossListCaches(queryClient, lookbookId, result);
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey(lookbookId), context.previous);
        overwriteLikeAcrossListCaches(queryClient, lookbookId, {
          isLiked: context.previous.isLiked,
          likeCount: context.previous.likeCount,
        });
      }
    },
  });
};

export const useSaveLookbook = (lookbookId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => saveLookbook(lookbookId),
    onSuccess: ({ saveId }) => {
      // 응답으로 받은 saveId를 상세 캐시에 바로 반영 — 재조회 없이도 버튼이 즉시
      // "저장됨" 상태(저장 취소 가능)로 바뀐다.
      queryClient.setQueryData<LookbookDetail>(detailKey(lookbookId), (old) =>
        old ? { ...old, saveId } : old,
      );
      queryClient.invalidateQueries({ queryKey: ['closetItems'] });
      alert('마이 클로젯에 저장했어요');
    },
  });
};

export const useUnsaveLookbook = (lookbookId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (saveId: number) => unsaveLookbook(saveId),
    onSuccess: () => {
      queryClient.setQueryData<LookbookDetail>(detailKey(lookbookId), (old) =>
        old ? { ...old, saveId: null } : old,
      );
      queryClient.invalidateQueries({ queryKey: ['closetItems'] });
    },
  });
};

export const useReportLookbook = (lookbookId: number) =>
  useMutation({
    mutationFn: (reason: ReportType) => reportLookbook(lookbookId, reason),
  });

export const useDeleteLookbook = (lookbookId: number) =>
  useMutation({
    mutationFn: () => deleteLookbook(lookbookId),
  });

export const useLookbookFeed = () =>
  useQuery({
    queryKey: ['lookbookFeed'],
    queryFn: () => getLookbookFeed(),
  });

// 트렌드 상세 화면의 "이 트렌드의 가성비 룩북" — 같은 태그를 가진 룩북만 조회
export const useLookbooksByTag = (tag: string) =>
  useQuery({
    queryKey: ['lookbookFeed', 'byTag', tag],
    queryFn: () => getLookbookFeed(undefined, tag),
    enabled: !!tag,
  });
