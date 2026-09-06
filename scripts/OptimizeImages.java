import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;

/** Derivados JPEG locales. El archivo original siempre se conserva. */
class OptimizeImages {
    public static void main(String[] args) throws Exception {
        if (args.length != 3) throw new IllegalArgumentException("Uso: origen destino tamaño-máximo");
        BufferedImage source = ImageIO.read(new File(args[0]));
        if (source == null) throw new IllegalArgumentException("Imagen no compatible");
        double scale = Math.min(1, Double.parseDouble(args[2]) / Math.max(source.getWidth(), source.getHeight()));
        int width = Math.max(1, (int)Math.round(source.getWidth() * scale));
        int height = Math.max(1, (int)Math.round(source.getHeight() * scale));
        BufferedImage output = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = output.createGraphics();
        g.setColor(new Color(8, 11, 13));
        g.fillRect(0, 0, width, height);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.drawImage(source, 0, 0, width, height, null);
        g.dispose();
        ImageIO.write(output, "jpg", new File(args[1]));
        System.out.println(args[1] + " — " + width + " × " + height + " — " + new File(args[1]).length() + " bytes");
    }
}
