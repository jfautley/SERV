﻿<%@ Page Language="C#" Inherits="SERVWeb.TakeControl" MasterPageFile="~/Master.master" %>
<%@ MasterType VirtualPath="~/Master.master" %>
<asp:Content ContentPlaceHolderID="titlePlaceholder" ID="titlePlaceholderContent" runat="server">
</asp:Content>
<asp:Content ContentPlaceHolderID="contentPlaceholder" ID="contentPlaceholderContent" runat="server">

<div id="entry">
	<h3>Controller Signon</h3>
	<div class="row">
		<div class="span7">
			<p>Using this screen controllers can divert the SERV NOW FlexTel number to their mobile / landline.</p>
		
			<div class="input-prepend input-append">
				<a type=button class="btn btn-lg" href="#" onclick="$('#txtNumber').removeAttr('disabled');"><i class="icon-lock"></i></a>
				<input type="text" id="txtNumber" value="<%=DefaultNumber%>" />
				<input type="button" value="Take Control" class="btn btn-primary btn-lg" onclick="takeControl($('#txtNumber').val());"></input>
			</div>
			<br/></br>
		</div>
		<div class="span1"></div>
		<div class="span3">
			<div id="pnlBloodCal" class="calDay calToday">...
			</div>
		</div>
	</div>
	<br/>

</div>

<script>

	$('#txtNumber').attr('disabled', 'disabled');
	showCals();
	$("#loading").slideUp();

</script>

</asp:Content>

