---
title: Explore the data
layout: default
permalink: /explore
---

<h1>People</h1>

{% for people in site.people %}

<a href="{{site.baseurl}}/{{people.url}}">{{people.preferredName}}</a><br>

{% endfor %}

<h1>Works</h1>
{% for work in site.works %}

<a href="{{site.baseurl}}/{{work.url}}">{{work.preferredName}}</a><br>

{% endfor %}