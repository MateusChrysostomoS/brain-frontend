// BrandFooter — 4-column site footer with brand col, Products, Company, Legal.
// Supports "brain" and "secretaria" variants — Products column links differ slightly.

import { BrandGlyph } from "./BrandGlyph";

type BrandFooterProps = {
  variant?: "brain" | "secretaria";
};

export function BrandFooter({ variant = "brain" }: BrandFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1 — brand mark + tagline */}
          <div className="footer-col">
            <a className="brand-mark" href="/" style={{ marginBottom: 14 }}>
              <BrandGlyph size={28} />
              <span className="wordmark" style={{ fontSize: 22 }}>
                Brain
              </span>
            </a>
            <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, maxWidth: "36ch" }}>
              {variant === "secretaria"
                ? "Inteligência nativa de WhatsApp para clínicas brasileiras. A secretarIA é um produto Brain, ao lado do PreCheck."
                : "Inteligência nativa de WhatsApp para clínicas brasileiras. Para que o tempo de consulta seja consulta."}
            </p>
          </div>

          {/* Column 2 — Produtos (links differ by variant) */}
          <div className="footer-col">
            <h4>Produtos</h4>
            {variant === "secretaria" ? (
              <>
                <a href="/precheck">PreCheck</a>
                <a href="/secretaria">secretarIA</a>
                <a href="/#planos">Planos</a>
                <a href="#seguranca">Segurança</a>
              </>
            ) : (
              <>
                <a href="/precheck">PreCheck</a>
                <a href="/secretaria">secretarIA</a>
                <a href="#planos">Planos</a>
                <a href="#seguranca">Segurança</a>
              </>
            )}
          </div>

          {/* Column 3 — Empresa */}
          <div className="footer-col">
            <h4>Empresa</h4>
            {variant === "secretaria" ? (
              <>
                <a href="/#empresa">A Brain</a>
                <a href="#contato">Contato</a>
                <a href="#">Setor público</a>
                <a href="#">Carreiras</a>
              </>
            ) : (
              <>
                <a href="#empresa">A Brain</a>
                <a href="#contato">Contato</a>
                <a href="#">Setor público</a>
                <a href="#">Carreiras</a>
              </>
            )}
          </div>

          {/* Column 4 — Legal */}
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Termos de uso</a>
            <a href="#">Política de privacidade</a>
            <a href="#">LGPD &amp; DPO</a>
            <a href="/login">Entrar</a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Brain. Todos os direitos reservados.</span>
          <span>PMB Consultoria e Assessoria Empresarial e Projetos LTDA</span>
        </div>
      </div>
    </footer>
  );
}
