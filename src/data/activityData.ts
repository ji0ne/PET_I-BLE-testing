//범위를 선언해놓고 그 범위 내 랜덤값을 변수에 할당 ,  export

const GYRO_RANGE = { min: -250, max: 250 }; // 자이로 데이터 범위 
const ACCEL_RANGE = { min: -10, max: 10 }; // 가속도 데이터 범위 
const BPM_RANGE = { min: 60, max: 120 }; // 심박수 범위 
const TEMPERATURE_RANGE = { min: 36.0, max: 39.0 }; //체온 범위

// 랜덤 값 생성 함수
const getRandomValue = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  };
  
  // 데이터 생성 함수
export const generateActivityData = () => {
    const gyroData = {
      x: getRandomValue(GYRO_RANGE.min, GYRO_RANGE.max),
      y: getRandomValue(GYRO_RANGE.min, GYRO_RANGE.max),
      z: getRandomValue(GYRO_RANGE.min, GYRO_RANGE.max),
    };
  
    const accelData = {
      x: getRandomValue(ACCEL_RANGE.min, ACCEL_RANGE.max),
      y: getRandomValue(ACCEL_RANGE.min, ACCEL_RANGE.max),
      z: getRandomValue(ACCEL_RANGE.min, ACCEL_RANGE.max),
    };
  
    const bpm = getRandomValue(BPM_RANGE.min, BPM_RANGE.max);
    const temperature = getRandomValue(TEMPERATURE_RANGE.min, TEMPERATURE_RANGE.max);
  
    return {
      gyroData,
      accelData,
      bpm,
      temperature,
    };
  };
  
  // 1초마다 데이터 생성 및 출력 
 /* setInterval(() => {
    const data = generateActivityData();
    console.log(data);
  }, 1000); */