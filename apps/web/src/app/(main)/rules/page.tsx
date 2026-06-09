import { Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nội quy',
  description: 'Quy tắc và nội quy của server Dogeland Minecraft',
};

const RULES = [
  {
    id: 1,
    title: 'Tôn trọng người chơi khác',
    content:
      'Không xúc phạm, phân biệt đối xử, quấy rối hoặc bắt nạt người chơi khác dưới bất kỳ hình thức nào. Mọi người đều có quyền được chơi trong môi trường vui vẻ và an toàn.',
    severity: 'critical' as const,
  },
  {
    id: 2,
    title: 'Không dùng hack, cheat hoặc exploit',
    content:
      'Nghiêm cấm sử dụng phần mềm hack, cheat client, macro, autoclicker hay bất kỳ công cụ nào tạo ra lợi thế không công bằng. Phát hiện sẽ bị ban vĩnh viễn.',
    severity: 'critical' as const,
  },
  {
    id: 3,
    title: 'Không spam, quảng cáo',
    content:
      'Không gửi tin nhắn lặp lại, flood chat, hoặc quảng cáo server/dịch vụ khác. Giữ chat sạch sẽ và có ích cho cộng đồng.',
    severity: 'major' as const,
  },
  {
    id: 4,
    title: 'Không griefing tài sản người khác',
    content:
      'Không phá hoại, ăn cắp, hoặc xâm phạm công trình và tài sản của người chơi khác. Hãy tôn trọng công sức mà người khác bỏ ra.',
    severity: 'major' as const,
  },
  {
    id: 5,
    title: 'Ngôn ngữ phù hợp',
    content:
      'Sử dụng ngôn ngữ văn minh, lịch sự. Không dùng ngôn từ tục tĩu, kỳ thị giới tính, chủng tộc, tôn giáo hay chính trị trong chat.',
    severity: 'major' as const,
  },
  {
    id: 6,
    title: 'Không scam, lừa đảo',
    content:
      'Không lừa đảo người chơi trong giao dịch, trao đổi vật phẩm. Mọi hành vi scam sẽ bị xử lý nghiêm và hoàn trả cho nạn nhân nếu có thể.',
    severity: 'major' as const,
  },
  {
    id: 7,
    title: 'Tuân theo hướng dẫn của BTC',
    content:
      'Admin và Moderator có quyền đưa ra quyết định cuối cùng. Hãy lắng nghe và tuân theo hướng dẫn của đội ngũ quản lý. Không cãi vã hay cố tình gây rối.',
    severity: 'info' as const,
  },
  {
    id: 8,
    title: 'Không chia sẻ thông tin nhạy cảm',
    content:
      'Không chia sẻ thông tin cá nhân (số điện thoại, địa chỉ, tài khoản ngân hàng) trong chat public. Giữ an toàn cho bản thân và người khác.',
    severity: 'info' as const,
  },
];

const SEVERITY_CONFIG = {
  critical: {
    label: 'Nghiêm trọng',
    className: 'border-red-500/30 bg-red-500/5',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    number: 'bg-red-500/20 text-red-400',
  },
  major: {
    label: 'Quan trọng',
    className: 'border-yellow-500/30 bg-yellow-500/5',
    badge: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    number: 'bg-yellow-500/20 text-yellow-500',
  },
  info: {
    label: 'Lưu ý',
    className: 'border-border bg-card',
    badge: 'bg-muted text-muted-foreground border-border',
    number: 'bg-muted text-muted-foreground',
  },
};

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Nội quy server</h1>
          <p className="text-muted-foreground mt-0.5">
            Vui lòng đọc kỹ và tuân thủ để tạo môi trường chơi tốt cho mọi người
          </p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-5 py-4 text-sm text-yellow-600 dark:text-yellow-400">
        <strong>Lưu ý:</strong> Vi phạm nội quy sẽ bị xử lý tuỳ theo mức độ — cảnh cáo, tạm ban hoặc ban vĩnh viễn.
        Ignorance is not an excuse — không biết luật không phải lý do để miễn trách.
      </div>

      {/* Rules list */}
      <div className="space-y-3">
        {RULES.map((rule) => {
          const cfg = SEVERITY_CONFIG[rule.severity];
          return (
            <div
              key={rule.id}
              className={`rounded-xl border px-5 py-4 space-y-2 ${cfg.className}`}
            >
              <div className="flex items-center gap-3">
                <span className={`rounded-lg px-2.5 py-1 text-sm font-black tabular-nums ${cfg.number}`}>
                  #{rule.id}
                </span>
                <h2 className="font-semibold flex-1">{rule.title}</h2>
                <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                {rule.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center border-t border-border pt-6">
        Nội quy có thể được cập nhật bất cứ lúc nào. Phiên bản hiện tại có hiệu lực từ tháng 1/2025.
      </p>
    </div>
  );
}
