import { ClozeExercise } from '../types/chemistry';

export const CURRICULUM_EXERCISES: ClozeExercise[] = [
  // ==========================================
  // PHẦN 1: NHẬN BIẾT
  // ==========================================
  {
    id: 'nb_01',
    title: 'Bài 1: Khái niệm Phản ứng Thuận Nghịch',
    subtitle: 'Nhận biết khái niệm phản ứng thuận nghịch và phản ứng một chiều',
    level: 'nhan_biet',
    levelLabel: 'Nhận biết',
    description: 'Điền các từ thích hợp vào chỗ trống để hoàn thiện khái niệm phản ứng thuận nghịch và phản ứng một chiều theo SGK Hoá học 11.',
    targetAchievement: 'Trình bày được khái niệm phản ứng thuận nghịch và trạng thái cân bằng của phản ứng thuận nghịch.',
    parts: [
      { type: 'text', content: 'Phản ứng một chiều là phản ứng chỉ xảy ra theo một chiều từ ' },
      { type: 'blank', blankId: 'nb_01_b1' },
      { type: 'text', content: ' tạo thành ' },
      { type: 'blank', blankId: 'nb_01_b2' },
      { type: 'text', content: ' trong điều kiện xác định. Phương trình phản ứng một chiều được biểu diễn bằng mũi tên một chiều (→).' },
      { type: 'text', content: '\n\nNgược lại, phản ứng thuận nghịch là phản ứng trong đó ở cùng điều kiện, xảy ra ' },
      { type: 'blank', blankId: 'nb_01_b3' },
      { type: 'text', content: ' sự chuyển chất đầu thành chất sản phẩm (phản ứng thuận) và sự chuyển ' },
      { type: 'blank', blankId: 'nb_01_b4' },
      { type: 'text', content: ' thành chất đầu (phản ứng nghịch). Trong phương trình hoá học, phản ứng thuận nghịch được biểu diễn bằng ' },
      { type: 'blank', blankId: 'nb_01_b5' },
      { type: 'text', content: ' (⇌).' }
    ],
    blanks: {
      'nb_01_b1': {
        id: 'nb_01_b1',
        correctAnswers: ['chất đầu', 'chat dau', 'chất phản ứng'],
        hint: 'Các chất tham gia ban đầu',
        explanation: 'Theo định nghĩa SGK: Phản ứng một chiều là phản ứng chỉ xảy ra theo một chiều từ chất đầu tạo thành chất sản phẩm.'
      },
      'nb_01_b2': {
        id: 'nb_01_b2',
        correctAnswers: ['chất sản phẩm', 'chat san pham', 'sản phẩm'],
        hint: 'Chất thu được sau phản ứng',
        explanation: 'Sản phẩm là chất được tạo thành sau quá trình biến đổi hoá học.'
      },
      'nb_01_b3': {
        id: 'nb_01_b3',
        correctAnswers: ['đồng thời', 'dong thoi', 'song song'],
        hint: 'Cùng một lúc, xảy ra song hành',
        explanation: 'Phản ứng thuận nghịch có đặc điểm then chốt là cả hai chiều phản ứng diễn ra đồng thời ở cùng điều kiện.'
      },
      'nb_01_b4': {
        id: 'nb_01_b4',
        correctAnswers: ['chất sản phẩm', 'chat san pham', 'sản phẩm'],
        hint: 'Chất tạo thành quay ngược lại thành chất ban đầu',
        explanation: 'Phản ứng nghịch là sự chuyển chất sản phẩm thành chất đầu.'
      },
      'nb_01_b5': {
        id: 'nb_01_b5',
        correctAnswers: ['mũi tên hai chiều', 'mui ten hai chieu', 'hai nửa mũi tên ngược chiều', 'hai nửa mũi tên'],
        hint: 'Kí hiệu ⇌ gồm 2 mũi tên ngược nhau',
        explanation: 'Phương trình phản ứng thuận nghịch quy ước dùng hai nửa mũi tên ngược chiều (⇌).'
      }
    },
    wordBank: ['chất đầu', 'chất sản phẩm', 'đồng thời', 'mũi tên hai chiều', 'hoàn toàn', 'vô hạn', 'nhiệt độ']
  },

  {
    id: 'nb_02',
    title: 'Bài 2: Trạng thái Cân bằng Hoá học',
    subtitle: 'Bản chất của trạng thái cân bằng của phản ứng thuận nghịch',
    level: 'nhan_biet',
    levelLabel: 'Nhận biết',
    description: 'Hoàn thiện mệnh đề về bản chất động của trạng thái cân bằng và mối quan hệ giữa tốc độ phản ứng thuận và nghịch.',
    targetAchievement: 'Trình bày được khái niệm trạng thái cân bằng của phản ứng thuận nghịch.',
    parts: [
      { type: 'text', content: 'Trạng thái cân bằng của phản ứng thuận nghịch là trạng thái tại đó tốc độ phản ứng thuận ' },
      { type: 'blank', blankId: 'nb_02_b1' },
      { type: 'text', content: ' tốc độ phản ứng nghịch (v_thuận = v_nghịch).' },
      { type: 'text', content: '\n\nCân bằng hoá học là một ' },
      { type: 'blank', blankId: 'nb_02_b2' },
      { type: 'text', content: ', nghĩa là tại trạng thái cân bằng, phản ứng thuận và phản ứng nghịch ' },
      { type: 'blank', blankId: 'nb_02_b3' },
      { type: 'text', content: ' xảy ra nhưng với tốc độ bằng nhau.' },
      { type: 'text', content: '\n\nDo đó, ở trạng thái cân bằng, ' },
      { type: 'blank', blankId: 'nb_02_b4' },
      { type: 'text', content: ' của các chất trong hệ phản ứng là ' },
      { type: 'blank', blankId: 'nb_02_b5' },
      { type: 'text', content: ' theo thời gian nếu không có tác động từ bên ngoài.' }
    ],
    blanks: {
      'nb_02_b1': {
        id: 'nb_02_b1',
        correctAnswers: ['bằng', 'bang', 'bằng với'],
        hint: 'So sánh dấu = giữa v_t và v_n',
        explanation: 'Đặc trưng cốt lõi của trạng thái cân bằng: tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch (vt = vn).'
      },
      'nb_02_b2': {
        id: 'nb_02_b2',
        correctAnswers: ['cân bằng động', 'can bang dong'],
        hint: 'Không phải cân bằng tĩnh (vẫn diễn ra chuyển động vi mô)',
        explanation: 'Cân bằng hoá học là cân bằng động vì các phân tử vẫn không ngừng va chạm và biến đổi qua lại.'
      },
      'nb_02_b3': {
        id: 'nb_02_b3',
        correctAnswers: ['vẫn tiếp tục', 'van tiep tuc', 'vẫn', 'tiếp tục'],
        hint: 'Không hề dừng lại',
        explanation: 'Phản ứng không hề dừng lại, các chất vẫn tiếp tục chuyển hóa cho nhau.'
      },
      'nb_02_b4': {
        id: 'nb_02_b4',
        correctAnswers: ['nồng độ', 'nong do', 'hàm lượng'],
        hint: 'Đại lượng mol/L đặc trưng cho lượng chất trong một đơn vị thể tích',
        explanation: 'Vì lượng chất mất đi bằng lượng chất tạo thành nên nồng độ các chất trong hệ không thay đổi.'
      },
      'nb_02_b5': {
        id: 'nb_02_b5',
        correctAnswers: ['không đổi', 'khong doi', 'không thay đổi'],
        hint: 'Hằng định, giữ nguyên giá trị',
        explanation: 'Nồng độ của tất cả các chất đầu và chất sản phẩm được giữ không đổi ở trạng thái cân bằng.'
      }
    },
    wordBank: ['bằng', 'cân bằng động', 'vẫn tiếp tục', 'nồng độ', 'không đổi', 'dừng lại', 'tăng dần', 'cân bằng tĩnh']
  },

  {
    id: 'nb_03',
    title: 'Bài 3: Biểu thức Hằng số Cân bằng (Kc)',
    subtitle: 'Công thức tính Kc và quy ước nồng độ chất rắn',
    level: 'nhan_biet',
    levelLabel: 'Nhận biết',
    description: 'Điền các thông tin chuẩn xác về biểu thức hằng số cân bằng nồng độ Kc của phản ứng thuận nghịch tổng quát aA + bB ⇌ cC + dD.',
    targetAchievement: 'Viết được biểu thức hằng số cân bằng (KC) của một phản ứng thuận nghịch.',
    parts: [
      { type: 'text', content: 'Xét phản ứng thuận nghịch tổng quát: aA + bB ⇌ cC + dD (các chất ở thể khí hoặc dung dịch).' },
      { type: 'text', content: '\nBiểu thức hằng số cân bằng nồng độ Kc là tỉ số giữa tích nồng độ của ' },
      { type: 'blank', blankId: 'nb_03_b1' },
      { type: 'text', content: ' với tích nồng độ của ' },
      { type: 'blank', blankId: 'nb_03_b2' },
      { type: 'text', content: ', với số mũ là ' },
      { type: 'blank', blankId: 'nb_03_b3' },
      { type: 'text', content: ' tương ứng trong phương trình hoá học:' },
      { type: 'text', content: '\nKc = ([C]^c · [D]^d) / ([A]^a · [B]^b)' },
      { type: 'text', content: '\n\nQuy ước quan trọng trong SGK: Nồng độ của ' },
      { type: 'blank', blankId: 'nb_03_b4' },
      { type: 'text', content: ' là một hằng số nên ' },
      { type: 'blank', blankId: 'nb_03_b5' },
      { type: 'text', content: ' xuất hiện trong biểu thức hằng số cân bằng Kc.' }
    ],
    blanks: {
      'nb_03_b1': {
        id: 'nb_03_b1',
        correctAnswers: ['các chất sản phẩm', 'cac chat san pham', 'chất sản phẩm', 'sản phẩm'],
        hint: 'Các chất nằm ở vế phải (tử số)',
        explanation: 'Tử số của biểu thức Kc là tích nồng độ các chất sản phẩm nâng lên lũy thừa bằng hệ số tỉ lượng.'
      },
      'nb_03_b2': {
        id: 'nb_03_b2',
        correctAnswers: ['các chất phản ứng', 'cac chat phan ung', 'chất đầu', 'cac chat dau'],
        hint: 'Các chất nằm ở vế trái (mẫu số)',
        explanation: 'Mẫu số của biểu thức Kc là tích nồng độ các chất phản ứng (chất đầu).'
      },
      'nb_03_b3': {
        id: 'nb_03_b3',
        correctAnswers: ['hệ số tỉ lượng', 'he so ti luong', 'hệ số cân bằng', 'hệ số'],
        hint: 'Các số a, b, c, d đứng trước công thức hoá học',
        explanation: 'Mỗi nồng độ đều được nâng lên số mũ bằng đúng hệ số tỉ lượng của chất đó trong phương trình.'
      },
      'nb_03_b4': {
        id: 'nb_03_b4',
        correctAnswers: ['chất rắn', 'chat ran', 'pha rắn'],
        hint: 'Trạng thái rắn (kí hiệu s)',
        explanation: 'Chất rắn tinh khiết có nồng độ coi như không đổi (quy ước bằng 1) nên không ghi vào biểu thức Kc.'
      },
      'nb_03_b5': {
        id: 'nb_03_b5',
        correctAnswers: ['không', 'khong', 'không được'],
        hint: 'Có hay không có trong công thức?',
        explanation: 'Chất rắn KHÔNG xuất hiện trong biểu thức Kc.'
      }
    },
    wordBank: ['các chất sản phẩm', 'các chất phản ứng', 'hệ số tỉ lượng', 'chất rắn', 'không', 'chất lỏng', 'luôn luôn', 'chất khí']
  },

  {
    id: 'nb_04',
    title: 'Bài 4: Ý nghĩa và Các Yếu tố Ảnh hưởng tới Kc',
    subtitle: 'Nhiệt độ và độ ưu thế của phản ứng thuận',
    level: 'nhan_biet',
    levelLabel: 'Nhận biết',
    description: 'Xác định các yếu tố quyết định giá trị của hằng số cân bằng Kc và ý nghĩa thực tiễn của nó.',
    targetAchievement: 'Viết được biểu thức và hiểu ý nghĩa độ lớn của hằng số cân bằng (KC).',
    parts: [
      { type: 'text', content: 'Hằng số cân bằng Kc của một phản ứng xác định chỉ phụ thuộc vào bản chất của phản ứng và ' },
      { type: 'blank', blankId: 'nb_04_b1' },
      { type: 'text', content: ', mà không phụ thuộc vào ' },
      { type: 'blank', blankId: 'nb_04_b2' },
      { type: 'text', content: ' ban đầu của các chất cũng như áp suất của hệ.' },
      { type: 'text', content: '\n\nÝ nghĩa: Giá trị Kc càng lớn hơn rất nhiều so với 1 chứng tỏ ở trạng thái cân bằng, nồng độ các chất sản phẩm lớn hơn nhiều so với chất phản ứng, phản ứng thuận ' },
      { type: 'blank', blankId: 'nb_04_b3' },
      { type: 'text', content: ' (hiệu suất cao). Ngược lại, nếu Kc rất nhỏ so với 1, phản ứng thuận ' },
      { type: 'blank', blankId: 'nb_04_b4' },
      { type: 'text', content: ' (hiệu suất thấp).' }
    ],
    blanks: {
      'nb_04_b1': {
        id: 'nb_04_b1',
        correctAnswers: ['nhiệt độ', 'nhiet do'],
        hint: 'Yếu tố duy nhất làm thay đổi giá trị của Kc đối với một phản ứng đã cho',
        explanation: 'Kc chỉ phụ thuộc vào nhiệt độ (T). Khi nhiệt độ không đổi, nồng độ hoặc áp suất biến đổi không làm đổi Kc.'
      },
      'nb_04_b2': {
        id: 'nb_04_b2',
        correctAnswers: ['nồng độ', 'nong do', 'nồng độ các chất'],
        hint: 'Lượng chất ban đầu nạp vào bình',
        explanation: 'Dù nồng độ ban đầu nạp vào bình là bao nhiêu, khi đạt cân bằng, tỉ số Kc vẫn giữ nguyên ở cùng nhiệt độ.'
      },
      'nb_04_b3': {
        id: 'nb_04_b3',
        correctAnswers: ['chiếm ưu thế', 'chiem uu the', 'ưu thế', 'xảy ra thuận lợi'],
        hint: 'Tạo ra nhiều sản phẩm',
        explanation: 'Kc >> 1 chứng tỏ phản ứng thuận diễn ra rất thuận lợi và chiếm ưu thế áp đảo.'
      },
      'nb_04_b4': {
        id: 'nb_04_b4',
        correctAnswers: ['kém ưu thế', 'kem uu the', 'ít ưu thế', 'không thuận lợi'],
        hint: 'Tạo ra rất ít sản phẩm',
        explanation: 'Kc << 1 biểu thị phản ứng thuận diễn ra không đáng kể, lượng chất đầu còn lại rất nhiều.'
      }
    },
    wordBank: ['nhiệt độ', 'nồng độ', 'chiếm ưu thế', 'kém ưu thế', 'thể tích', 'chất xúc tác', 'tốc độ']
  },

  // ==========================================
  // PHẦN 2: THÔNG HIỂU (THÍ NGHIỆM)
  // ==========================================
  {
    id: 'th_01',
    title: 'Bài 5: Thí nghiệm Cân bằng khí NO2 và N2O4',
    subtitle: 'Nghiên cứu ảnh hưởng của nhiệt độ tới chuyển dịch cân bằng 2NO2 ⇌ N2O4',
    level: 'thong_hieu',
    levelLabel: 'Thông hiểu',
    description: 'Phân tích hiện tượng đổi màu và bản chất toả nhiệt/thu nhiệt khi thay đổi nhiệt độ của hệ khí NO2 (nâu đỏ) và N2O4 (không màu).',
    targetAchievement: 'Thực hiện được thí nghiệm nghiên cứu ảnh hưởng của nhiệt độ tới chuyển dịch cân bằng: Phản ứng 2NO2 ⇌ N2O4',
    experimentContext: {
      type: 'no2_n2o4',
      equation: '2NO2 (k, nâu đỏ) ⇌ N2O4 (k, không màu)   ΔrH°298 = -58 kJ',
      thermalEffect: 'Phản ứng thuận là toả nhiệt (ΔrH < 0), phản ứng nghịch là thu nhiệt (ΔrH > 0)'
    },
    parts: [
      { type: 'text', content: 'Cho phản ứng: 2NO2 (khí, màu ' },
      { type: 'blank', blankId: 'th_01_b1' },
      { type: 'text', content: ') ⇌ N2O4 (khí, ' },
      { type: 'blank', blankId: 'th_01_b2' },
      { type: 'text', content: ') có ΔrH°298 = -58 kJ < 0 (chiều thuận ' },
      { type: 'blank', blankId: 'th_01_b3' },
      { type: 'text', content: ').' },
      { type: 'text', content: '\n\n• Khi ngâm ống nghiệm chứa hỗn hợp vào cốc nước đá (hạ nhiệt độ): Màu của hỗn hợp khí ' },
      { type: 'blank', blankId: 'th_01_b4' },
      { type: 'text', content: ', chứng tỏ cân bằng chuyển dịch theo chiều ' },
      { type: 'blank', blankId: 'th_01_b5' },
      { type: 'text', content: ' (chiều toả nhiệt để bù lại nhiệt độ bị mất).' },
      { type: 'text', content: '\n• Khi ngâm ống nghiệm vào cốc nước nóng (tăng nhiệt độ): Màu của hỗn hợp khí ' },
      { type: 'blank', blankId: 'th_01_b6' },
      { type: 'text', content: ' hơn, chứng tỏ cân bằng chuyển dịch theo chiều ' },
      { type: 'blank', blankId: 'th_01_b7' },
      { type: 'text', content: ' (chiều thu nhiệt để giảm tác động của nhiệt độ cao).' }
    ],
    blanks: {
      'th_01_b1': {
        id: 'th_01_b1',
        correctAnswers: ['nâu đỏ', 'nau do', 'màu nâu đỏ'],
        hint: 'Màu đặc trưng của khí nitrogen dioxide (NO2)',
        explanation: 'Khí NO2 có màu nâu đỏ rất rõ nét.'
      },
      'th_01_b2': {
        id: 'th_01_b2',
        correctAnswers: ['không màu', 'khong mau'],
        hint: 'Khí dinitrogen tetroxide (N2O4) có màu gì?',
        explanation: 'N2O4 là chất khí không màu.'
      },
      'th_01_b3': {
        id: 'th_01_b3',
        correctAnswers: ['toả nhiệt', 'toa nhiet'],
        hint: 'Dấu ΔrH < 0 cho biết tỏa hay thu nhiệt?',
        explanation: 'Biến thiên enthalpy âm (ΔrH < 0) biểu thị phản ứng thuận là phản ứng toả nhiệt.'
      },
      'th_01_b4': {
        id: 'th_01_b4',
        correctAnswers: ['nhạt dần', 'nhat dan', 'nhạt màu dần', 'nhạt đi'],
        hint: 'Nồng độ NO2 nâu đỏ giảm bớt thì màu sắc sẽ ra sao?',
        explanation: 'Khi ngâm nước đá, cân bằng chuyển dịch tạo thêm N2O4 không màu và tiêu thụ NO2, làm màu nâu nhạt dần.'
      },
      'th_01_b5': {
        id: 'th_01_b5',
        correctAnswers: ['thuận', 'thuan', 'chiều thuận'],
        hint: 'Tạo N2O4 (từ trái sang phải)',
        explanation: 'Hạ nhiệt độ làm cân bằng chuyển dịch theo chiều phản ứng toả nhiệt (chiều thuận).'
      },
      'th_01_b6': {
        id: 'th_01_b6',
        correctAnswers: ['đậm dần', 'dam dan', 'đậm hơn', 'nâu đậm hơn'],
        hint: 'Tạo thêm khí NO2 màu nâu đỏ',
        explanation: 'Tăng nhiệt độ kích thích chiều thu nhiệt tạo thêm NO2, khiến hỗn hợp có màu nâu đỏ đậm dần.'
      },
      'th_01_b7': {
        id: 'th_01_b7',
        correctAnswers: ['nghịch', 'nghich', 'chiều nghịch'],
        hint: 'Chiều từ phải sang trái (thu nhiệt)',
        explanation: 'Tăng nhiệt độ làm cân bằng chuyển dịch theo chiều nghịch (chiều thu nhiệt).'
      }
    },
    wordBank: ['nâu đỏ', 'không màu', 'toả nhiệt', 'nhạt dần', 'thuận', 'đậm dần', 'nghịch', 'thu nhiệt', 'vàng chanh']
  },

  {
    id: 'th_02',
    title: 'Bài 6: Thí nghiệm Thuỷ phân Sodium Acetate (CH3COONa)',
    subtitle: 'Nghiên cứu ảnh hưởng của nhiệt độ tới cân bằng thuỷ phân muối',
    level: 'thong_hieu',
    levelLabel: 'Thông hiểu',
    description: 'Giải thích hiện tượng biến đổi màu chỉ thị phenolphthalein khi đun nóng và làm nguội dung dịch sodium acetate.',
    targetAchievement: 'Thực hiện được thí nghiệm nghiên cứu ảnh hưởng của nhiệt độ tới chuyển dịch cân bằng: Phản ứng thuỷ phân sodium acetate.',
    experimentContext: {
      type: 'sodium_acetate',
      equation: 'CH3COO- + H2O ⇌ CH3COOH + OH-   (ΔrH° > 0)',
      thermalEffect: 'Phản ứng thuỷ phân ion axetat là phản ứng thu nhiệt'
    },
    parts: [
      { type: 'text', content: 'Ion acetate bị thuỷ phân trong nước theo phương trình:' },
      { type: 'text', content: '\nCH3COO⁻ + H2O ⇌ CH3COOH + OH⁻ (ΔrH > 0, chiều thuận là ' },
      { type: 'blank', blankId: 'th_02_b1' },
      { type: 'text', content: ').' },
      { type: 'text', content: '\nDo sinh ra ion OH⁻ tạo môi trường base yếu, khi thêm vài giọt phenolphthalein, dung dịch có màu ' },
      { type: 'blank', blankId: 'th_02_b2' },
      { type: 'text', content: '.' },
      { type: 'text', content: '\n\n• Khi đun nóng ống nghiệm trên ngọn lửa đèn cồn (tăng nhiệt độ): Màu hồng của dung dịch ' },
      { type: 'blank', blankId: 'th_02_b3' },
      { type: 'text', content: ', chứng tỏ cân bằng chuyển dịch theo chiều ' },
      { type: 'blank', blankId: 'th_02_b4' },
      { type: 'text', content: ' (làm tăng nồng độ ion ' },
      { type: 'blank', blankId: 'th_02_b5' },
      { type: 'text', content: ').' },
      { type: 'text', content: '\n• Khi ngâm ống nghiệm vào cốc nước đá (làm lạnh): Màu hồng của dung dịch ' },
      { type: 'blank', blankId: 'th_02_b6' },
      { type: 'text', content: ', chứng tỏ cân bằng chuyển dịch theo chiều nghịch (toả nhiệt).' }
    ],
    blanks: {
      'th_02_b1': {
        id: 'th_02_b1',
        correctAnswers: ['thu nhiệt', 'thu nhiet'],
        hint: 'ΔrH > 0 là thu nhiệt hay tỏa nhiệt?',
        explanation: 'Phản ứng thuỷ phân muối có ΔrH > 0 là phản ứng thu nhiệt.'
      },
      'th_02_b2': {
        id: 'th_02_b2',
        correctAnswers: ['hồng nhạt', 'hong nhat', 'hồng', 'màu hồng'],
        hint: 'Phenolphthalein gặp môi trường kiềm bazơ nhẹ chuyển sang màu gì?',
        explanation: 'Phenolphthalein chuyển màu hồng trong môi trường base do ion OH- tạo ra.'
      },
      'th_02_b3': {
        id: 'th_02_b3',
        correctAnswers: ['đậm dần', 'dam dan', 'đậm hơn', 'đậm dần lên'],
        hint: 'Nồng độ OH- tăng lên làm màu hồng ra sao?',
        explanation: 'Khi đun nóng, chiều thuận thu nhiệt được thúc đẩy làm tăng nồng độ OH-, dung dịch chuyển sang màu hồng đậm.'
      },
      'th_02_b4': {
        id: 'th_02_b4',
        correctAnswers: ['thuận', 'thuan', 'chiều thuận'],
        hint: 'Chiều thu nhiệt hấp thụ năng lượng nhiệt cấp vào',
        explanation: 'Tăng nhiệt độ làm cân bằng chuyển dịch theo chiều thu nhiệt (chiều thuận).'
      },
      'th_02_b5': {
        id: 'th_02_b5',
        correctAnswers: ['OH-', 'OH⁻', 'hydroxide', 'hidroxit'],
        hint: 'Anion quyết định tính kiềm',
        explanation: 'Ion OH- làm đổi màu thuốc thử phenolphthalein.'
      },
      'th_02_b6': {
        id: 'th_02_b6',
        correctAnswers: ['nhạt dần', 'nhat dan', 'nhạt đi', 'mờ dần'],
        hint: 'Ngược lại với lúc đun nóng',
        explanation: 'Làm lạnh làm giảm nồng độ OH-, màu hồng nhạt dần.'
      }
    },
    wordBank: ['thu nhiệt', 'hồng nhạt', 'đậm dần', 'thuận', 'OH-', 'nhạt dần', 'toả nhiệt', 'xanh lam', 'H+']
  },

  // ==========================================
  // PHẦN 3: VẬN DỤNG (NGUYÊN LÍ LE CHATELIER)
  // ==========================================
  {
    id: 'vd_01',
    title: 'Bài 7: Nguyên lí Chuyển dịch Cân bằng Le Chatelier',
    subtitle: 'Nội dung cốt lõi và quy luật phản ứng của hệ cân bằng',
    level: 'van_dung',
    levelLabel: 'Vận dụng',
    description: 'Vận dụng phát biểu chính xác nguyên lí Le Chatelier để dự đoán xu hướng tự điều chỉnh của một hệ phản ứng.',
    targetAchievement: 'Vận dụng được nguyên lí chuyển dịch cân bằng Le Chatelier để giải thích ảnh hưởng của nhiệt độ, nồng độ, áp suất.',
    parts: [
      { type: 'text', content: 'Nguyên lí chuyển dịch cân bằng Le Chatelier phát biểu rằng:' },
      { type: 'text', content: '\n"Một phản ứng thuận nghịch đang ở trạng thái cân bằng, khi chịu một tác động từ bên ngoài như sự thay đổi ' },
      { type: 'blank', blankId: 'vd_01_b1' },
      { type: 'text', content: ', nhiệt độ hoặc ' },
      { type: 'blank', blankId: 'vd_01_b2' },
      { type: 'text', content: ', thì cân bằng sẽ chuyển dịch theo chiều ' },
      { type: 'blank', blankId: 'vd_01_b3' },
      { type: 'text', content: ' tác động bên ngoài đó."' },
      { type: 'text', content: '\n\nCụ thể quy luật:' },
      { type: 'text', content: '\n• Khi tăng nhiệt độ, cân bằng chuyển dịch theo chiều ' },
      { type: 'blank', blankId: 'vd_01_b4' },
      { type: 'text', content: ' (ΔrH > 0); khi giảm nhiệt độ, cân bằng chuyển dịch theo chiều ' },
      { type: 'blank', blankId: 'vd_01_b5' },
      { type: 'text', content: ' (ΔrH < 0).' },
      { type: 'text', content: '\n• Khi tăng áp suất chung của hệ khí, cân bằng chuyển dịch theo chiều làm ' },
      { type: 'blank', blankId: 'vd_01_b6' },
      { type: 'text', content: ' số mol chất khí.' }
    ],
    blanks: {
      'vd_01_b1': {
        id: 'vd_01_b1',
        correctAnswers: ['nồng độ', 'nong do'],
        hint: 'Đại lượng nồng độ các chất',
        explanation: '3 yếu tố bên ngoài ảnh hưởng chuyển dịch cân bằng là nồng độ, nhiệt độ và áp suất.'
      },
      'vd_01_b2': {
        id: 'vd_01_b2',
        correctAnswers: ['áp suất', 'ap suat'],
        hint: 'Lực nén trên một đơn vị diện tích (chỉ xét với hệ có chất khí)',
        explanation: 'Áp suất là yếu tố thứ 3 làm chuyển dịch cân bằng nếu có sự biến đổi số mol khí.'
      },
      'vd_01_b3': {
        id: 'vd_01_b3',
        correctAnswers: ['làm giảm', 'lam giam', 'chống lại', 'triệt tiêu'],
        hint: 'Hệ luôn có xu hướng chống đối hoặc giảm nhẹ tác động áp đặt',
        explanation: 'Cốt lõi nguyên lí: Chuyển dịch theo chiều làm giảm tác động bên ngoài đó.'
      },
      'vd_01_b4': {
        id: 'vd_01_b4',
        correctAnswers: ['thu nhiệt', 'thu nhiet'],
        hint: 'Tiêu thụ bớt nhiệt lượng được cấp vào',
        explanation: 'Tăng nhiệt độ: cân bằng chuyển dịch theo chiều thu nhiệt (làm giảm nhiệt độ).'
      },
      'vd_01_b5': {
        id: 'vd_01_b5',
        correctAnswers: ['toả nhiệt', 'toa nhiet'],
        hint: 'Sinh ra thêm nhiệt lượng bù vào phần mất đi',
        explanation: 'Giảm nhiệt độ: cân bằng chuyển dịch theo chiều toả nhiệt (làm tăng nhiệt độ).'
      },
      'vd_01_b6': {
        id: 'vd_01_b6',
        correctAnswers: ['giảm', 'giam', 'làm giảm'],
        hint: 'Tăng áp suất -> nén hệ -> xu hướng giảm bớt số hạt khí',
        explanation: 'Tăng áp suất làm hệ chuyển dịch theo chiều có ít mol khí hơn để giảm áp lực.'
      }
    },
    wordBank: ['nồng độ', 'áp suất', 'làm giảm', 'thu nhiệt', 'toả nhiệt', 'giảm', 'tăng', 'làm tăng', 'khối lượng']
  },

  {
    id: 'vd_02',
    title: 'Bài 8: Vận dụng trong Công nghiệp Tổng hợp Ammonia (Haber-Bosch)',
    subtitle: 'Tối ưu hoá hiệu suất tổng hợp NH3 từ N2 và H2',
    level: 'van_dung',
    levelLabel: 'Vận dụng',
    description: 'Áp dụng nguyên lí Le Chatelier để giải thích các điều kiện áp suất, nhiệt độ, nồng độ và chất xúc tác trong tổng hợp ammonia công nghiệp.',
    targetAchievement: 'Vận dụng được nguyên lí chuyển dịch cân bằng Le Chatelier để giải thích ảnh hưởng của nhiệt độ, nồng độ, áp suất trong thực tế sản xuất.',
    parts: [
      { type: 'text', content: 'Phản ứng tổng hợp ammonia: N2 (g) + 3H2 (g) ⇌ 2NH3 (g)   ΔrH°298 = -92 kJ < 0.' },
      { type: 'text', content: '\nSố mol khí vế trái là 1 + 3 = 4 mol, vế phải là 2 mol.' },
      { type: 'text', content: '\n\n1. Về áp suất: Khi ' },
      { type: 'blank', blankId: 'vd_02_b1' },
      { type: 'text', content: ' áp suất của hệ, cân bằng chuyển dịch theo chiều làm giảm số mol khí (chiều thuận, từ 4 mol thành 2 mol khí), giúp ' },
      { type: 'blank', blankId: 'vd_02_b2' },
      { type: 'text', content: ' hiệu suất tạo ra NH3. Vì vậy trong thực tế người ta dùng áp suất cao (khoảng 200 bar).' },
      { type: 'text', content: '\n\n2. Về nhiệt độ: Vì phản ứng thuận là ' },
      { type: 'blank', blankId: 'vd_02_b3' },
      { type: 'text', content: ' (ΔrH < 0), về mặt cân bằng nên ' },
      { type: 'blank', blankId: 'vd_02_b4' },
      { type: 'text', content: ' nhiệt độ để cân bằng chuyển dịch sang chiều thuận. Tuy nhiên ở nhiệt độ quá thấp tốc độ phản ứng xảy ra rất chậm, do đó cần chọn nhiệt độ tối ưu khoảng 400 - 450 °C.' },
      { type: 'text', content: '\n\n3. Về nồng độ: Người ta liên tục ' },
      { type: 'blank', blankId: 'vd_02_b5' },
      { type: 'text', content: ' khí NH3 ra khỏi hỗn hợp phản ứng bằng cách hoá lỏng, làm cân bằng tiếp tục chuyển dịch theo ' },
      { type: 'blank', blankId: 'vd_02_b6' },
      { type: 'text', content: '.' },
      { type: 'text', content: '\n\n4. Chất xúc tác bột sắt (Fe) có vai trò ' },
      { type: 'blank', blankId: 'vd_02_b7' },
      { type: 'text', content: ' tốc độ đạt tới trạng thái cân bằng chứ không làm chuyển dịch cân bằng.' }
    ],
    blanks: {
      'vd_02_b1': {
        id: 'vd_02_b1',
        correctAnswers: ['tăng', 'tang'],
        hint: 'Nén áp suất cao hay giảm áp suất?',
        explanation: 'Tăng áp suất làm cân bằng dịch chuyển sang chiều có 2 mol khí (chiều thuận).'
      },
      'vd_02_b2': {
        id: 'vd_02_b2',
        correctAnswers: ['tăng', 'tang', 'nâng cao'],
        hint: 'Tạo nhiều NH3 hơn tức là hiệu suất ra sao?',
        explanation: 'Giúp tăng sản lượng và hiệu suất tạo ammonia.'
      },
      'vd_02_b3': {
        id: 'vd_02_b3',
        correctAnswers: ['toả nhiệt', 'toa nhiet'],
        hint: 'ΔrH = -92 kJ mang dấu âm',
        explanation: 'Biến thiên enthalpy âm chứng minh phản ứng thuận toả nhiệt.'
      },
      'vd_02_b4': {
        id: 'vd_02_b4',
        correctAnswers: ['hạ', 'ha', 'giảm', 'hạ thấp'],
        hint: 'Để thúc đẩy chiều tỏa nhiệt thì nên làm lạnh hay đun sôi?',
        explanation: 'Hạ nhiệt độ thúc đẩy chiều toả nhiệt (chiều thuận tạo NH3).'
      },
      'vd_02_b5': {
        id: 'vd_02_b5',
        correctAnswers: ['tách', 'tach', 'lấy', 'rút', 'tách bỏ'],
        hint: 'Lấy sản phẩm ra để giảm nồng độ NH3',
        explanation: 'Liên tục tách NH3 ra khỏi hệ làm giảm nồng độ chất sản phẩm, kích thích phản ứng tiếp tục diễn ra.'
      },
      'vd_02_b6': {
        id: 'vd_02_b6',
        correctAnswers: ['chiều thuận', 'chieu thuan', 'thuận'],
        hint: 'Chiều tạo ra thêm NH3 bù lại lượng vừa bị rút ra',
        explanation: 'Cân bằng chuyển dịch theo chiều thuận tạo tiếp ammonia.'
      },
      'vd_02_b7': {
        id: 'vd_02_b7',
        correctAnswers: ['tăng', 'tang', 'làm tăng', 'đẩy nhanh'],
        hint: 'Xúc tác đẩy nhanh tốc độ phản ứng',
        explanation: 'Chất xúc tác làm tăng tốc độ phản ứng cả 2 chiều như nhau, giúp hệ nhanh đạt cân bằng mà không làm đổi vị trí cân bằng.'
      }
    },
    wordBank: ['tăng', 'toả nhiệt', 'hạ', 'tách', 'chiều thuận', 'làm tăng', 'giảm', 'thu nhiệt', 'chiều nghịch', 'thay đổi']
  },

  {
    id: 'vd_03',
    title: 'Bài 9: Vận dụng Cân bằng Dị thể trong Nung Vôi (CaCO3)',
    subtitle: 'Phân tích phản ứng dị thể rắn - khí và cách tăng hiệu suất nung vôi',
    level: 'van_dung',
    levelLabel: 'Vận dụng',
    description: 'Vận dụng nguyên lí Le Chatelier giải thích tại sao mở cửa lò nung vôi và tăng nhiệt độ giúp phân huỷ đá vôi triệt để.',
    targetAchievement: 'Vận dụng được nguyên lí chuyển dịch cân bằng Le Chatelier để giải thích ảnh hưởng của nhiệt độ, nồng độ, áp suất tới phản ứng dị thể.',
    parts: [
      { type: 'text', content: 'Phản ứng nung vôi: CaCO3 (rắn) ⇌ CaO (rắn) + CO2 (khí)   ΔrH°298 = +178 kJ > 0.' },
      { type: 'text', content: '\n\n• Ảnh hưởng của nhiệt độ: Phản ứng thuận là phản ứng ' },
      { type: 'blank', blankId: 'vd_03_b1' },
      { type: 'text', content: ' (ΔrH > 0). Do đó khi ' },
      { type: 'blank', blankId: 'vd_03_b2' },
      { type: 'text', content: ' nhiệt độ của lò nung (khoảng 900 - 1000 °C), cân bằng chuyển dịch theo chiều ' },
      { type: 'blank', blankId: 'vd_03_b3' },
      { type: 'text', content: ', làm tăng tốc độ và độ phân huỷ của đá vôi CaCO3.' },
      { type: 'text', content: '\n\n• Ảnh hưởng của nồng độ và áp suất CO2: Khí CO2 sinh ra nếu được ' },
      { type: 'blank', blankId: 'vd_03_b4' },
      { type: 'text', content: ' liên tục ra khỏi lò nung (bằng cách thông gió, mở nắp lò), làm nồng độ và áp suất riêng phần của CO2 giảm xuống, cân bằng sẽ liên tục chuyển dịch theo ' },
      { type: 'blank', blankId: 'vd_03_b5' },
      { type: 'text', content: '.' },
      { type: 'text', content: '\n\n• Ảnh hưởng của chất rắn: Nếu cho thêm một lượng đá vôi CaCO3 (rắn) vào lò thì cân bằng ' },
      { type: 'blank', blankId: 'vd_03_b6' },
      { type: 'text', content: ' chuyển dịch, vì nồng độ của chất rắn là hằng số.' }
    ],
    blanks: {
      'vd_03_b1': {
        id: 'vd_03_b1',
        correctAnswers: ['thu nhiệt', 'thu nhiet'],
        hint: 'ΔrH = +178 kJ mang dấu dương',
        explanation: 'ΔrH > 0 nghĩa là phản ứng phân huỷ CaCO3 thu nhiệt mạnh.'
      },
      'vd_03_b2': {
        id: 'vd_03_b2',
        correctAnswers: ['tăng', 'tang', 'nâng cao'],
        hint: 'Đốt than cung cấp nhiệt độ cao',
        explanation: 'Tăng nhiệt độ kích thích chiều thu nhiệt (chiều thuận nung vôi).'
      },
      'vd_03_b3': {
        id: 'vd_03_b3',
        correctAnswers: ['thuận', 'thuan', 'chiều thuận'],
        hint: 'Chiều tạo CaO và CO2',
        explanation: 'Cân bằng chuyển dịch sang chiều thuận để tiêu thụ nhiệt lượng cung cấp.'
      },
      'vd_03_b4': {
        id: 'vd_03_b4',
        correctAnswers: ['hút', 'hut', 'thổi', 'đưa', 'thoát', 'thông'],
        hint: 'Làm thoát khí CO2 ra ngoài lò',
        explanation: 'Hút hoặc thông gió cho CO2 thoát ra ngoài giúp giảm nồng độ sản phẩm trong lò.'
      },
      'vd_03_b5': {
        id: 'vd_03_b5',
        correctAnswers: ['chiều thuận', 'chieu thuan', 'thuận'],
        hint: 'Tiếp tục sinh thêm CO2 và vôi sống CaO',
        explanation: 'Giảm CO2 làm cân bằng dịch chuyển theo chiều thuận tạo thêm CaO và CO2.'
      },
      'vd_03_b6': {
        id: 'vd_03_b6',
        correctAnswers: ['không', 'khong', 'không bị', 'không hề'],
        hint: 'Thêm hay bớt chất rắn có làm đổi cân bằng không?',
        explanation: 'Chất rắn tinh khiết không làm thay đổi vị trí cân bằng vì nồng độ của nó không xuất hiện trong biểu thức cân bằng.'
      }
    },
    wordBank: ['thu nhiệt', 'tăng', 'thuận', 'hút', 'chiều thuận', 'không', 'toả nhiệt', 'giảm', 'chiều nghịch', 'luôn']
  }
];

export const THEORY_SUMMARY = {
  nhanBiet: [
    {
      title: '1. Phản ứng thuận nghịch & Một chiều',
      content: '• Phản ứng một chiều (→): Chỉ xảy ra theo một chiều từ chất đầu tạo thành sản phẩm trong điều kiện xác định.\n• Phản ứng thuận nghịch (⇌): Ở cùng điều kiện, xảy ra đồng thời sự chuyển chất đầu thành sản phẩm (phản ứng thuận) và sự chuyển sản phẩm thành chất đầu (phản ứng nghịch).'
    },
    {
      title: '2. Trạng thái cân bằng hoá học',
      content: '• Là trạng thái của phản ứng thuận nghịch khi tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch (vt = vn).\n• Cân bằng hoá học là cân bằng động: phản ứng vẫn tiếp tục diễn ra vi mô nhưng nồng độ các chất trong hệ không đổi.'
    },
    {
      title: '3. Biểu thức Hằng số cân bằng (Kc)',
      content: '• Với phản ứng: aA + bB ⇌ cC + dD\n  Kc = ([C]^c · [D]^d) / ([A]^a · [B]^b)\n• Quy ước: Nồng độ chất rắn không xuất hiện trong biểu thức Kc (coi bằng 1).\n• Kc chỉ phụ thuộc vào bản chất phản ứng và nhiệt độ (T).\n• Kc >> 1: phản ứng thuận chiếm ưu thế; Kc << 1: phản ứng thuận kém ưu thế.'
    }
  ],
  thongHieu: [
    {
      title: 'Thí nghiệm 1: 2NO2 (nâu đỏ) ⇌ N2O4 (không màu)',
      content: '• ΔrH°298 = -58 kJ < 0 (thuận toả nhiệt, nghịch thu nhiệt).\n• Ngâm nước đá (hạ T): Cân bằng chuyển dịch theo chiều thuận (chiều toả nhiệt) → màu nhạt dần.\n• Ngâm nước nóng (tăng T): Cân bằng chuyển dịch theo chiều nghịch (chiều thu nhiệt) → màu nâu đỏ đậm dần.'
    },
    {
      title: 'Thí nghiệm 2: Thuỷ phân Sodium acetate',
      content: '• CH3COO⁻ + H2O ⇌ CH3COOH + OH⁻ (ΔrH > 0: thuận thu nhiệt, nghịch toả nhiệt).\n• Ban đầu: OH⁻ tạo môi trường kiềm làm phenolphthalein có màu hồng nhạt.\n• Đun nóng (tăng T): Chuyển dịch theo chiều thuận (thu nhiệt) → sinh thêm OH⁻ → màu hồng đậm dần.\n• Làm lạnh: Chuyển dịch chiều nghịch → màu hồng nhạt dần.'
    }
  ],
  vanDung: [
    {
      title: 'Nguyên lí chuyển dịch cân bằng Le Chatelier',
      content: '• Phát biểu: Một phản ứng thuận nghịch đang ở trạng thái cân bằng, khi chịu một tác động từ bên ngoài (nồng độ, nhiệt độ, áp suất), thì cân bằng sẽ chuyển dịch theo chiều làm giảm tác động bên ngoài đó.'
    },
    {
      title: 'Quy luật điều chỉnh hệ cân bằng',
      content: '• Nhiệt độ: Tăng T → dịch chuyển theo chiều thu nhiệt (ΔrH > 0); Giảm T → dịch chuyển chiều toả nhiệt (ΔrH < 0).\n• Nồng độ: Tăng nồng độ chất nào → dịch chuyển chiều giảm chất đó (tiêu thụ); Giảm nồng độ chất nào → dịch chuyển chiều tạo thêm chất đó.\n• Áp suất: Tăng p → dịch chuyển chiều giảm số mol khí; Giảm p → dịch chuyển chiều tăng số mol khí (áp suất chỉ ảnh hưởng hệ có khí và chênh lệch số mol khí hai vế).\n• Chất xúc tác: KHÔNG làm chuyển dịch cân bằng, chỉ làm tăng tốc độ để hệ nhanh đạt trạng thái cân bằng hơn.'
    },
    {
      title: 'Ứng dụng thực tiễn',
      content: '• Tổng hợp ammonia: N2 + 3H2 ⇌ 2NH3 (tăng áp suất ~200 bar, nhiệt độ tối ưu 450°C có xúc tác Fe, liên tục tách hoá lỏng NH3).\n• Nung vôi: CaCO3 (r) ⇌ CaO (r) + CO2 (k) (tăng T ~950°C, hút thông gió thoát CO2 để cân bằng chuyển dịch theo chiều thuận tạo CaO).'
    }
  ]
};
