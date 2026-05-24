export type VivusPreviewScreenshot = {
  capturedAt: string;
  source: string;
  imageBase64: string | null;
};

export async function capturePreviewScreenshot(
  iframe: HTMLIFrameElement | null,
): Promise<VivusPreviewScreenshot> {
  try {
    if (!iframe?.contentWindow?.document) {
      return {
        capturedAt: new Date().toISOString(),
        source: 'preview-iframe',
        imageBase64: null,
      };
    }

    const html =
      iframe.contentWindow.document.documentElement
        ?.outerHTML ?? '';

    const encoded = btoa(
      unescape(
        encodeURIComponent(html.slice(0, 500000)),
      ),
    );

    return {
      capturedAt: new Date().toISOString(),
      source: 'preview-iframe',
      imageBase64: encoded,
    };
  } catch {
    return {
      capturedAt: new Date().toISOString(),
      source: 'preview-iframe',
      imageBase64: null,
    };
  }
}
