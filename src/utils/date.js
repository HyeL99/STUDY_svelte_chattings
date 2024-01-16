import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'; // 상대시간을 알아내는 기능
import utc from 'dayjs/plugin/utc'; // utc형태로 포맷된 날짜데이터 표현 기능
import 'dayjs/locale/ko'; // 언어설정

const dateView = date => {
  dayjs.extend(utc);
  dayjs.locale('ko');
  dayjs.extend(relativeTime);

  return dayjs().to(dayjs(date).utc().format('YYYY-MM-DD HH:mm:ss'));
}

export default dateView;