import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { getProductDetail } from '../api/products';

export const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const numericProductId = Number(productId);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['productDetail', numericProductId],
    queryFn: () => getProductDetail(numericProductId),
    enabled: Number.isFinite(numericProductId),
  });

  const handlePurchase = () => {
    const url = data?.affiliateUrl ?? data?.purchaseUrl;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-[480px] min-h-screen mx-auto bg-bg flex flex-col text-text relative">
      <div className="flex items-center p-[12px_20px_8px] shrink-0 bg-bg sticky top-0 z-10">
        <span onClick={() => navigate(-1)} className="text-text-secondary cursor-pointer p-1" role="button" aria-label="뒤로가기">
          <ArrowLeft size={22} strokeWidth={2} />
        </span>
        <span className="text-[16px] font-bold text-text ml-2">상품 상세</span>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-[13px] text-text-secondary">
          불러오는 중...
        </div>
      )}

      {isError && (
        <div className="flex-1 flex items-center justify-center text-[13px] text-error-400">
          상품 정보를 불러오지 못했습니다.
        </div>
      )}

      {data && (
        <div className="flex-1 overflow-y-auto px-[20px] pb-[110px]">
          <div
            className="w-full h-[375px] rounded-[14px] bg-bg-secondary bg-cover bg-center mt-2"
            style={{ backgroundImage: data.imageUrl ? `url(${data.imageUrl})` : undefined }}
          ></div>

          {data.dataStatus === 'STALE_SNAPSHOT' && (
            <div className="mt-3 rounded-[10px] bg-[#FFF6E5] border border-[#F3D9A0] px-[12px] py-[8px] text-[11px] text-[#7A5B00]">
              오래된 정보일 수 있어요. 구매 전 최신 정보를 다시 확인해주세요.
            </div>
          )}

          <div className="mt-4">
            <div className="text-[11px] text-text-secondary">{data.brandName}</div>
            <div className="text-[16px] font-bold text-text mt-1">{data.name}</div>
            <div className="text-[12px] text-text-secondary mt-1">{data.sellerName}</div>

            <div className="text-[20px] font-extrabold text-primary-800 mt-3">
              {data.price.amount.toLocaleString()}
              {data.price.currency === 'KRW' ? '원' : ` ${data.price.currency}`}
            </div>

            <div className="mt-2 text-[11px] font-semibold">
              {data.availability === 'AVAILABLE' && (
                <span className="text-primary-600">구매 가능</span>
              )}
              {data.availability === 'TEMPORARILY_UNRESOLVED' && (
                <span className="text-error-400">일시적으로 확인이 어려운 상품이에요</span>
              )}
              {data.availability !== 'AVAILABLE' && data.availability !== 'TEMPORARILY_UNRESOLVED' && (
                <span className="text-text-secondary">{data.availability}</span>
              )}
            </div>

            {data.tags.length > 0 && (
              <div className="flex gap-[6px] flex-wrap mt-3">
                {data.tags.map((tag) => (
                  <span key={tag} className="text-[11px] bg-primary-50 text-primary-800 px-[10px] py-[4px] rounded-full font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {data && (
        <div className="absolute bottom-[20px] left-[20px] right-[20px]">
          <p className="text-[10px] text-text-secondary text-center mb-[6px]">
            외부 판매처({data.sellerName})로 이동합니다. 결제는 이동한 사이트에서 진행돼요.
          </p>
          <button
            onClick={handlePurchase}
            disabled={data.availability === 'TEMPORARILY_UNRESOLVED'}
            className="w-full text-bg text-[15px] font-bold border-none rounded-[14px] p-[16px] bg-primary-400 hover:bg-primary-500 transition-colors disabled:bg-border disabled:text-text-secondary"
          >
            구매하러 가기 ↗
          </button>
        </div>
      )}
    </div>
  );
};
