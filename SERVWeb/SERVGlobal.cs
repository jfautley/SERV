using System;
using SERVDataContract;

namespace SERVWeb
{
	public static class SERVGlobal
	{

		public static Service Service = new Service();

		public static string SERVVersion = "1.9.8.1";

		public static User User
		{
			get
			{
				if (System.Web.HttpContext.Current.Session["User"] == null) { return null; }
				return (User)System.Web.HttpContext.Current.Session["User"];
			}
			set
			{
				System.Web.HttpContext.Current.Session["User"] = value;
			}
		}

		public static string SystemName = "SERV";
		public static string GroupName = new System.Configuration.AppSettingsReader().GetValue("GroupName", typeof(string)).ToString();
		public static bool PushBulletEnabled = (bool) new System.Configuration.AppSettingsReader().GetValue("PushBulletEnabled", typeof(bool));
		public static string TwitterID = new System.Configuration.AppSettingsReader().GetValue("TwitterID", typeof(string)).ToString();
		public static string TwitterWidgetID = new System.Configuration.AppSettingsReader().GetValue("TwitterWidgetID", typeof(string)).ToString();
		public static string ForumURL = new System.Configuration.AppSettingsReader().GetValue("ForumURL", typeof(string)).ToString();


		public static void GotoDefault()
		{
			System.Web.HttpContext.Current.Response.Redirect("Default.aspx");
		}

		public static void GotoLogin(string dest)
		{
			System.Web.HttpContext.Current.Response.Redirect("Login.aspx?dest=" + dest);
		}

		public static void AssertAuthentication()
		{
			if (SERVGlobal.User == null) { GotoLogin(System.Web.HttpContext.Current.Request.Path); }
		}

		public static void AssertAuthentication(int minUserLevel, string rejectionMessage)
		{
			if (SERVGlobal.User == null) { GotoLogin(System.Web.HttpContext.Current.Request.Path); }
			if (SERVGlobal.User.UserLevelID < minUserLevel)
			{
				System.Web.HttpContext.Current.Response.Redirect("Home.aspx?message=" + rejectionMessage);
			}
		}

		public static string CSSInclude()
		{
			#if DEBUG
			return "<link rel=\"stylesheet\" href=\"/css/style.css\" />";
			#else
			return "<link rel=\"stylesheet\" href=\"/css/style." + SERVVersion + ".css\" />";
			#endif
		}

		public static string CalendarJSInclude()
		{
#if DEBUG
			return "<script language=\"JavaScript\" src=\"js/Calendar.js\"></script>";
#else
			return "<script language=\"JavaScript\" src=\"js/Calendar." + SERVVersion + ".min.js\"></script>";
#endif
		}

		public static string MainJSInclude()
		{
#if DEBUG
			return "<script language=\"JavaScript\" src=\"js/JS.js\"></script>";
#else
		return "<script language=\"JavaScript\" src=\"js/JS." + SERVVersion + ".min.js\"></script>";
#endif
		}

		public static string ControllerLogJSInclude()
		{
#if DEBUG
			return "<script language=\"JavaScript\" src=\"js/ControllerLog.js\"></script>";
#else
			return "<script language=\"JavaScript\" src=\"js/ControllerLog." + SERVVersion + ".min.js\"></script>";
#endif
		}

		public static string OpsMapJSInclude()
		{
#if DEBUG
			return "<script language=\"JavaScript\" src=\"js/opsMap.js\"></script>";
#else
			return "<script language=\"JavaScript\" src=\"js/opsMap." + SERVVersion + ".min.js\"></script>";
#endif
		}

		public static bool AALogging
		{
			get
			{
				return true;
			}
		}

	}
}

