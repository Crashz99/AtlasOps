# Rehaul notes

## Preserved from the original UI/product

- graphite/dark operational visual language
- steel-blue primary accent
- map as a major product surface
- record ledger concept
- search and filtering
- analytics
- exports
- configurable option lists
- organisation hierarchy concept
- user administration concept
- custom map markers/legend intent

## Removed/replaced

- `form1.html`, `form2.html`, `form3.html`
- Activity / Incident / Tracking hard-coding
- `selection.html` form selection flow
- Group A / Group B semantics
- five-level hierarchy limit
- record type inference from arbitrary payload keys
- local Leaflet tile fallback
- offline map mode
- local SQLite persistence
- SQLite-backed sessions
- generated first-run admin credentials
- browser-to-local-Ollama AI dependency
- duplicated form-editing logic in multiple pages
- giant generic KV blobs as the primary application model

## New product model

```text
Organisation workspace
  -> unlimited forms
      -> versioned fields/options
          -> submissions
              -> records ledger
              -> online map when location data exists
              -> generic analytics
  -> organisation units
  -> saved locations
  -> custom map annotations
  -> members / roles
  -> settings / branding
```

## Recommended next production engineering layer

1. PostgreSQL schema for organisations, memberships, forms, form versions, submissions, locations and audit events.
2. Server-side authentication and invitation flow.
3. Per-organisation authorization checks.
4. File/image attachment storage.
5. Saved record views and configurable dashboard widgets.
6. Conditional form logic.
7. Approval workflows and notifications.
8. Real audit trail.
9. Import mapper for CSV/Excel.
10. Server-side analytics for large datasets.


## Guided tour rehaul (v3)

The demo guide is no longer a static floating text card. It now targets real controls using explicit `data-guide` anchors, dims the rest of the interface, draws a spotlight around the active control, and shows a large animated arrow. Navigation steps advance when the user clicks the highlighted destination. Role-switch steps advance only after the user actually selects the requested role. Tour progress is kept in `sessionStorage` so it survives route changes without becoming permanent product data.

The tour deliberately demonstrates the product split: Member work view → Submit → Records → Map → switch to Admin → Organisation setup → Forms → switch back to Member.

Typography uses Manrope for interface copy and Space Grotesk for display text. Fine-pointer desktop devices also receive a custom Atlas globe/orbit cursor, while text entry and map dragging retain native purpose-specific cursors.
