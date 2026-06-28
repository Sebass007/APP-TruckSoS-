package com.trucksos.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.trucksos.app.MainActivity
import com.trucksos.app.R

class TruckSOSWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        when (intent.action) {
            "ACTION_EMERGENCY" -> {
                openAppWithDeepLink(context, "trucksos://emergency")
            }
            "ACTION_HISTORY" -> {
                openAppWithDeepLink(context, "trucksos://history")
            }
            "ACTION_MECHANIC" -> {
                openAppWithDeepLink(context, "trucksos://mechanic-register")
            }
        }
    }

    private fun openAppWithDeepLink(context: Context, deepLink: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink))
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            context.startActivity(intent)
        } catch (e: Exception) {
            val intent = Intent(context, MainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            context.startActivity(intent)
        }
    }
}

private fun updateAppWidget(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int
) {
    val views = RemoteViews(context.packageName, R.layout.widget_trucksos_layout)
    views.setTextViewText(R.id.tv_widget_time, "15 min")

    val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE

    val emergencyIntent = Intent(context, TruckSOSWidget::class.java)
    emergencyIntent.action = "ACTION_EMERGENCY"
    views.setOnClickPendingIntent(
        R.id.btn_widget_emergency,
        PendingIntent.getBroadcast(context, 0, emergencyIntent, flags)
    )

    val historyIntent = Intent(context, TruckSOSWidget::class.java)
    historyIntent.action = "ACTION_HISTORY"
    views.setOnClickPendingIntent(
        R.id.btn_widget_history,
        PendingIntent.getBroadcast(context, 1, historyIntent, flags)
    )

    val mechanicIntent = Intent(context, TruckSOSWidget::class.java)
    mechanicIntent.action = "ACTION_MECHANIC"
    views.setOnClickPendingIntent(
        R.id.btn_widget_mechanic,
        PendingIntent.getBroadcast(context, 2, mechanicIntent, flags)
    )

    appWidgetManager.updateAppWidget(appWidgetId, views)
}