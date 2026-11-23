// ابزار قالب‌بندی فارسی

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** تبدیل ارقام انگلیسی به فارسی */
export function toFa(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[+d]);
}

/** قالب‌بندی قیمت با جداکننده هزارگان فارسی */
export function formatPrice(toman: number): string {
  // جداکننده سه‌رقمی با «٬»
  const grouped = Math.round(toman).toLocaleString('en-US').replace(/,/g, '٬');
  return toFa(grouped);
}

/** قیمت با واحد تومان */
export function priceLabel(toman: number): string {
  return `${formatPrice(toman)} تومان`;
}

/** قالب‌بندی وزن/ابعاد و اعداد اعشاری */
export function faNum(input: number | string): string {
  return toFa(input);
}

/** خلاصه تعداد (مثلاً ۱٬۲۴۰) */
export function formatCount(n: number): string {
  return toFa(n.toLocaleString('en-US').replace(/,/g, '٬'));
}

/** تبدیل تاریخ ISO به تاریخ شمسی تقریبی فارسی (نمایشی) */
export function faDate(iso: string): string {
  try {
    const d = new Date(iso);
    const months = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
    ];
    // تقریب شمسی از میلادی
    const gy = d.getFullYear();
    const gm = d.getMonth() + 1;
    const gd = d.getDate();
    let jy = gy - 621;
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const gy2 = gm > 2 ? gy + 1 : gy;
    let days =
      365 * gy +
      Math.floor((gy2 + 3) / 4) -
      Math.floor((gy2 + 99) / 100) +
      Math.floor((gy2 + 399) / 400) -
      80 +
      gd +
      g_d_m[gm - 1];
    jy += Math.floor(days / 365);
    days %= 365;
    let jm = 0;
    if (days < 31) jm = 1;
    else {
      days -= 31;
      if (days < 30) jm = 2;
      else {
        days -= 30;
        if (days < 31) jm = 3;
        else {
          days -= 31;
          if (days < 31) jm = 4;
          else {
            days -= 31;
            if (days < 31) jm = 5;
            else {
              days -= 31;
              if (days < 30) jm = 6;
              else {
                days -= 30;
                if (days < 30) jm = 7;
                else {
                  days -= 30;
                  if (days < 29) jm = 8;
                  else {
                    days -= 29;
                    if (days < 30) jm = 9;
                    else {
                      days -= 30;
                      if (days < 29) jm = 10;
                      else {
                        days -= 29;
                        if (days < 30) jm = 11;
                        else {
                          days -= 30;
                          jm = 12;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    const jd = days + 1;
    return `${toFa(jd)} ${months[jm - 1]} ${toFa(jy)}`;
  } catch {
    return toFa(iso);
  }
}

/** برش خلاصه متن */
export function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trim() + '…';
}
