package lk.sipsaviya.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

/**
 * SipSaviya — Sri Lankan school books, past papers and an on-device AI tutor.
 *
 * The whole product (UI, content and the AI engine) lives inside
 * assets/www as an offline web app. This activity is only the native shell:
 * it hosts the WebView, routes external links to the system browser and
 * exposes a tiny JS bridge so the web layer can talk to Android.
 */
public class MainActivity extends Activity {

    private static final String START_URL = "file:///android_asset/www/index.html";
    private WebView web;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);

        FrameLayout root = new FrameLayout(this);
        root.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        root.setBackgroundColor(Color.parseColor("#0B1220"));

        web = new WebView(this);
        web.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        web.setBackgroundColor(Color.parseColor("#0B1220"));
        root.addView(web);
        setContentView(root);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setLoadsImagesAutomatically(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            s.setSafeBrowsingEnabled(false);
        }

        CookieManager.getInstance().setAcceptCookie(true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUrl(request.getUrl().toString());
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(url);
            }
        });

        web.setWebChromeClient(new WebChromeClient());

        // Any download link (past paper / textbook PDF) goes to the real browser
        // or a PDF capable app instead of being swallowed by the WebView.
        web.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                        String mimeType, long contentLength) {
                openExternal(url);
            }
        });

        web.addJavascriptInterface(new Bridge(), "SipAndroid");
        web.loadUrl(START_URL);
    }

    /** Returns true when the URL was handled outside the WebView. */
    private boolean handleUrl(String url) {
        if (url == null) return false;
        if (url.startsWith("file://")) return false;          // internal app pages
        if (url.startsWith("mailto:") || url.startsWith("tel:")
                || url.startsWith("sms:") || url.startsWith("whatsapp:")) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (ActivityNotFoundException ignored) {
                toast(getString(R.string.no_app_for_link));
            }
            return true;
        }
        if (url.startsWith("http://") || url.startsWith("https://")) {
            openExternal(url);
            return true;
        }
        return false;
    }

    private void openExternal(String url) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (ActivityNotFoundException e) {
            toast(getString(R.string.no_app_for_link));
        }
    }

    private void toast(String msg) {
        runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show());
    }

    @Override
    public void onBackPressed() {
        if (web != null) {
            // Let the web layer decide: close a sheet / go back a screen / exit.
            web.evaluateJavascript(
                "(function(){try{return (window.SipApp&&window.SipApp.nativeBack&&window.SipApp.nativeBack())?'1':'0';}catch(e){return '0';}})()",
                value -> {
                    if (!"\"1\"".equals(value) && !"1".equals(value)) {
                        finish();
                    }
                });
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    /** Small bridge exposed to JavaScript as window.SipAndroid */
    private class Bridge {
        @JavascriptInterface
        public boolean isAndroid() {
            return true;
        }

        @JavascriptInterface
        public String platform() {
            return "android-" + Build.VERSION.SDK_INT;
        }

        @JavascriptInterface
        public String appVersion() {
            try {
                return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "1.0.0";
            }
        }

        @JavascriptInterface
        public void openExternal(String url) {
            if (url == null) return;
            final String u = url.trim();
            runOnUiThread(() -> MainActivity.this.openExternal(u));
        }

        @JavascriptInterface
        public void share(String text) {
            if (text == null) return;
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("text/plain");
                i.putExtra(Intent.EXTRA_TEXT, text);
                Intent chooser = Intent.createChooser(i, getString(R.string.share_via));
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(chooser);
            });
        }

        @JavascriptInterface
        public void toast(String msg) {
            if (msg != null) MainActivity.this.toast(msg);
        }

        /** Web layer reports the current theme so the system bars match. */
        @JavascriptInterface
        public void setSystemBars(final String backgroundHex, final boolean darkIcons) {
            runOnUiThread(() -> {
                try {
                    Window w = getWindow();
                    int color = Color.parseColor(backgroundHex);
                    w.setStatusBarColor(color);
                    w.setNavigationBarColor(color);
                    View decor = w.getDecorView();
                    int flags = decor.getSystemUiVisibility();
                    if (darkIcons) {
                        flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                        }
                    } else {
                        flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                        }
                    }
                    decor.setSystemUiVisibility(flags);
                } catch (Exception ignored) {
                }
            });
        }
    }
}
