<%@ Page Language="C#" Inherits="SERVWeb.Home" MasterPageFile="~/Master.master" %>
<%@ MasterType VirtualPath="~/Master.master" %>

<asp:Content ContentPlaceHolderID="titlePlaceholder" ID="titlePlaceholderContent" runat="server">System</asp:Content>
<asp:Content ContentPlaceHolderID="contentPlaceholder" ID="contentPlaceholderContent" runat="server">
	
	<div class="hero-unit">
		<h2>Hey <%=this.Username%>,</h2>	
		<p>Now that you have logged in, please make sure you <a href="ChangePassword.aspx">change your password</a>.  You can then <a href="ViewMember.aspx?self=yes">view and edit your profile</a> to make sure it is all correct, or take a look at the <a href="Members.aspx">members list</a>.</p>	
		<p>You will notice an "Admin editable only" section in your profile.  If you need something changed in there, please PM <a target="_blank" href="http://servssl.org.uk/members/index.php?/user/29-tristan-phillips/">Tris</a>.</p>
		<p>There will be loads of cool things coming along in this new system, and the majority of the benefits will be realised if we all keep our volunteer profiles and preferences up to date.  If you have any suggestions or comments, then feel free to PM <a target="_blank" href="http://servssl.org.uk/members/index.php?/user/29-tristan-phillips/">Tris</a>.</p>
	</div>
	
	<div class="row">
		<div class="span1"></div>
		<div class="span4">
			<h3>Version 1.2.2</h3>
			<h4>Recent Changes</h4>
			<ul>
				<li>Top 10 Volunteers</li>
				<li>Time fixes to raw log import</li>
			</ul>
			<h5>Previously</h5>
			<ul>
				<li>Recent Runs List</li>
				<li>Locations List</li>
				<li>New menu structure</li>
				<li>More mobile friendly, try it!</li>
				<li>Bulk SMS is here</li>
				<li>Loads of work on the controller logging.  We may get to the new system for logging before the end of the month</li>
				<li>The batch loader for the old logs kept in Google is working well</li>
				<li>Title changes. The change password screen said "Login" . . . Doh</li>
			</ul>

		</div>
		<div class="span2"></div>
		<div class="span4">
			<h3>Coming Soon</h3>
			<ul>
				<li>Controller Logging - No more Google!</li>
				<li>Run stats - See how many runs you / we have done &amp; how busy we are on different nights</li>
			</ul>
			<h3>Known Issues</h3>
			<ul>
				<li>Lack of validation</li>
			</ul>
			<p>Found an issue? PM <a target="_blank" href="http://servssl.org.uk/members/index.php?/user/29-tristan-phillips/">Tris</p>
		</div>
		<div class="span1"></div>
	</div>
	
	<script>
		$("#loading").hide();
		if ("<%=this.Success%>" == "yes") { $("#success").slideDown(); window.setTimeout('$("#success").slideUp()',4000); }
	</script>
	
</asp:Content>
