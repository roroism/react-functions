import axios from "axios";
import { useEffect, useRef, useState } from "react";
import useIntersectionObserver from "./hooks/useIntersectionObserver";

interface Airline {
  id: number;
  name: string;
  country: string;
  logo: string;
  slogan: string;
  head_quaters: string;
  website: string;
  established: string;
}

interface Passenger {
  _id: string;
  name: string;
  trips: number;
  airline: Airline;
  __v: number;
}

interface Props {
  isLastItem: boolean;
  onFetchMorePassengers: () => void;
  children: any;
}

const Passenger: React.FC<Props> = ({
  isLastItem,
  onFetchMorePassengers,
  children,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const entry = useIntersectionObserver(ref, {});
  const isIntersecting = !!entry?.isIntersecting;

  // A-1 마지막 항목이고 겹치는 영역이 있을 때, 콜백함수 onFetchMorePassengers() 실행. 실행하면 그 다음페이지로 set
  useEffect(() => {
    isLastItem && isIntersecting && onFetchMorePassengers();
  }, [isLastItem, isIntersecting]);

  return (
    <div
      ref={ref}
      style={{ minHeight: "100vh", display: "flex", border: "1px dashed #000" }}
    >
      {children}
    </div>
  );
};

function App() {
  const [passengers, setPassengers] = useState<Array<Passenger>>([]);
  const [isLast, setIsLast] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);

  const getPassengers = async () => {
    const params = { size: 10, page };

    try {
      const res = await axios.get(
        "https://api.instantwebtools.net/v1/passenger",
        { params }
      );

      const passengers = res.data.data;
      const isLast = res.data.totalPages === page;

      setPassengers((prev) => [...prev, ...passengers]);
      setIsLast(isLast);
    } catch (e) {
      console.error(e);
    }
  };

  // A-3 page 변경이 일어나고, 마지막 페이지가 아니라면 getPassengers() 실행. 그럼 다음 목록을 불러옴.
  useEffect(() => {
    !isLast && getPassengers();
  }, [page]);

  return (
    <div>
      {passengers.map((passenger, idx) => (
        <Passenger
          key={passenger._id}
          isLastItem={passengers.length - 1 === idx} // 마지막 요소에 마지막이라는 flag를 남깁니다.
          onFetchMorePassengers={() => setPage((prev) => prev + 1)} // A-2 마지막 항목에 도달했을 때 그 다음페이지로 set
        >
          {passenger.name}
        </Passenger>
      ))}
    </div>
  );
}

export default App;
